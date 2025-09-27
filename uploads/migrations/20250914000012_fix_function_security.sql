-- =====================================================
-- ZIGNAL - Fix Function Security Settings
-- Created: 2025-09-14
-- Description: Fix search_path security warnings for database functions
-- =====================================================

-- Fix function search_path security warnings by ensuring all functions
-- have SECURITY DEFINER SET search_path = '' to prevent search_path injection

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id, 
        email, 
        username, 
        full_name, 
        avatar_url,
        trader_level,
        package,
        status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username', 
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        'BEGINNER',
        'BASIC',
        'ONLINE'
    );
    
    -- Create default trading account
    INSERT INTO public.trading_accounts (
        user_id,
        name,
        account_type,
        balance,
        currency,
        is_active
    )
    VALUES (
        NEW.id,
        'Demo Account',
        'DEMO',
        10000.00,
        'USD',
        true
    );
    
    -- Send welcome notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        priority
    )
    VALUES (
        NEW.id,
        'Welcome to Zignal!',
        'Your account has been created successfully. Start exploring our trading signals and features.',
        'success',
        'normal'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to calculate portfolio total value
CREATE OR REPLACE FUNCTION public.calculate_portfolio_value(user_uuid UUID, account_uuid UUID DEFAULT NULL)
RETURNS DECIMAL(20,8) AS $$
DECLARE
    total_value DECIMAL(20,8) := 0;
BEGIN
    SELECT COALESCE(SUM(ph.total_value), 0)
    INTO total_value
    FROM public.portfolio_holdings ph
    WHERE ph.user_id = user_uuid
    AND (account_uuid IS NULL OR ph.trading_account_id = account_uuid);
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update portfolio holdings
CREATE OR REPLACE FUNCTION public.update_portfolio_holding(
    user_uuid UUID,
    account_uuid UUID,
    symbol_text TEXT,
    quantity_change DECIMAL(20,8),
    price DECIMAL(20,8)
)
RETURNS VOID AS $$
DECLARE
    current_qty DECIMAL(20,8) := 0;
    current_avg_cost DECIMAL(20,8) := 0;
    new_qty DECIMAL(20,8);
    new_avg_cost DECIMAL(20,8);
BEGIN
    -- Get current holding
    SELECT quantity, average_cost
    INTO current_qty, current_avg_cost
    FROM public.portfolio_holdings
    WHERE user_id = user_uuid
    AND trading_account_id = account_uuid
    AND symbol = symbol_text;
    
    -- If no existing holding found, set defaults
    IF current_qty IS NULL THEN
        current_qty := 0;
        current_avg_cost := 0;
    END IF;
    
    new_qty := current_qty + quantity_change;
    
    -- Calculate new average cost
    IF new_qty > 0 AND quantity_change > 0 THEN
        new_avg_cost := ((current_qty * current_avg_cost) + (quantity_change * price)) / new_qty;
    ELSIF new_qty = 0 THEN
        new_avg_cost := 0;
    ELSE
        new_avg_cost := current_avg_cost;
    END IF;
    
    -- Insert or update holding
    INSERT INTO public.portfolio_holdings (
        user_id,
        trading_account_id,
        symbol,
        quantity,
        average_cost,
        current_price,
        total_value,
        last_updated
    )
    VALUES (
        user_uuid,
        account_uuid,
        symbol_text,
        new_qty,
        new_avg_cost,
        price,
        new_qty * price,
        NOW()
    )
    ON CONFLICT (user_id, trading_account_id, symbol)
    DO UPDATE SET
        quantity = new_qty,
        average_cost = new_avg_cost,
        current_price = price,
        total_value = new_qty * price,
        unrealized_pnl = (new_qty * price) - (new_qty * new_avg_cost),
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to calculate win rate
CREATE OR REPLACE FUNCTION public.calculate_win_rate(user_uuid UUID, days INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_trades INTEGER := 0;
    winning_trades INTEGER := 0;
    win_rate DECIMAL(5,2) := 0;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE pnl > 0)
    INTO total_trades, winning_trades
    FROM public.trades
    WHERE user_id = user_uuid
    AND status = 'CLOSED'
    AND closed_at >= NOW() - (days || ' days')::INTERVAL;
    
    IF total_trades > 0 THEN
        win_rate := (winning_trades * 100.0) / total_trades;
    END IF;
    
    RETURN win_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    portfolio_value DECIMAL(20,8);
    total_pnl DECIMAL(20,8);
    win_rate DECIMAL(5,2);
    active_trades INTEGER;
    total_trades INTEGER;
    account_balance DECIMAL(20,8);
BEGIN
    -- Get portfolio value
    SELECT public.calculate_portfolio_value(user_uuid) INTO portfolio_value;
    
    -- Get total PnL
    SELECT COALESCE(SUM(pnl), 0)
    INTO total_pnl
    FROM public.trades
    WHERE user_id = user_uuid AND status = 'CLOSED';
    
    -- Get win rate
    SELECT public.calculate_win_rate(user_uuid) INTO win_rate;
    
    -- Get active trades count
    SELECT COUNT(*)
    INTO active_trades
    FROM public.trades
    WHERE user_id = user_uuid AND status = 'OPEN';
    
    -- Get total trades count
    SELECT COUNT(*)
    INTO total_trades
    FROM public.trades
    WHERE user_id = user_uuid;
    
    -- Get account balance
    SELECT COALESCE(account_balance, 0)
    INTO account_balance
    FROM public.user_profiles
    WHERE user_id = user_uuid;
    
    -- Build JSON result
    result := json_build_object(
        'portfolio_value', COALESCE(portfolio_value, 0),
        'total_pnl', COALESCE(total_pnl, 0),
        'win_rate', COALESCE(win_rate, 0),
        'active_trades', COALESCE(active_trades, 0),
        'total_trades', COALESCE(total_trades, 0),
        'account_balance', COALESCE(account_balance, 0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle trade execution
CREATE OR REPLACE FUNCTION public.handle_trade_execution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update portfolio holdings when trade is closed
    IF NEW.status = 'CLOSED' AND OLD.status != 'CLOSED' THEN
        -- Update portfolio holdings
        PERFORM public.update_portfolio_holding(
            NEW.user_id,
            NEW.trading_account_id,
            split_part(NEW.pair, '/', 1), -- Extract base currency
            CASE WHEN NEW.side = 'BUY' THEN NEW.quantity ELSE -NEW.quantity END,
            NEW.exit_price
        );
        
        -- Calculate and update PnL
        NEW.pnl := CASE 
            WHEN NEW.side = 'BUY' THEN 
                (NEW.exit_price - NEW.entry_price) * NEW.quantity - NEW.fees
            ELSE 
                (NEW.entry_price - NEW.exit_price) * NEW.quantity - NEW.fees
        END;
        
        NEW.pnl_percentage := (NEW.pnl / (NEW.entry_price * NEW.quantity)) * 100;
        NEW.closed_at := NOW();
        
        -- Update account balance
        UPDATE public.trading_accounts 
        SET balance = balance + NEW.pnl
        WHERE id = NEW.trading_account_id;
        
        -- Send notification
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            priority,
            metadata
        )
        VALUES (
            NEW.user_id,
            'Trade Closed',
            'Your ' || NEW.side || ' trade for ' || NEW.pair || ' has been closed with P&L of ' || NEW.pnl::TEXT,
            CASE WHEN NEW.pnl > 0 THEN 'success' ELSE 'warning' END,
            'normal',
            json_build_object(
                'trade_id', NEW.id,
                'pair', NEW.pair,
                'pnl', NEW.pnl,
                'side', NEW.side
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add comments for security documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function for new user creation. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.calculate_portfolio_value(UUID, UUID) IS 'Calculate total portfolio value for a user. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.update_portfolio_holding(UUID, UUID, TEXT, DECIMAL, DECIMAL) IS 'Update portfolio holdings after trade execution. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.calculate_win_rate(UUID, INTEGER) IS 'Calculate win rate percentage for a user. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.get_dashboard_stats(UUID) IS 'Get comprehensive dashboard statistics for a user. Uses SECURITY DEFINER with fixed search_path for security.';
COMMENT ON FUNCTION public.handle_trade_execution() IS 'Trigger function for trade execution and portfolio updates. Uses SECURITY DEFINER with fixed search_path for security.';