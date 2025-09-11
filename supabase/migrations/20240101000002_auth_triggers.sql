-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate user balance
CREATE OR REPLACE FUNCTION public.get_user_balance(user_uuid UUID)
RETURNS DECIMAL(20,8) AS $$
DECLARE
    deposits DECIMAL(20,8);
    withdrawals DECIMAL(20,8);
    balance DECIMAL(20,8);
BEGIN
    -- Calculate total completed deposits
    SELECT COALESCE(SUM(amount), 0)
    INTO deposits
    FROM public.transactions
    WHERE user_id = user_uuid
    AND type = 'DEPOSIT'
    AND status = 'COMPLETED';

    -- Calculate total completed withdrawals
    SELECT COALESCE(SUM(amount), 0)
    INTO withdrawals
    FROM public.transactions
    WHERE user_id = user_uuid
    AND type = 'WITHDRAWAL'
    AND status = 'COMPLETED';

    -- Calculate balance
    balance := deposits - withdrawals;
    
    RETURN GREATEST(balance, 0); -- Ensure balance never goes negative
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    balance DECIMAL(20,8);
    pnl_today DECIMAL(20,8);
    open_signals INTEGER;
    total_trades INTEGER;
    winning_trades INTEGER;
    win_rate DECIMAL(5,2);
    last_deposit DECIMAL(20,8);
BEGIN
    -- Get balance
    balance := public.get_user_balance(user_uuid);
    
    -- Calculate PnL for today
    SELECT COALESCE(SUM(pnl), 0)
    INTO pnl_today
    FROM public.trades
    WHERE user_id = user_uuid
    AND DATE(time) = CURRENT_DATE
    AND pnl IS NOT NULL;
    
    -- Count open signals
    SELECT COUNT(*)
    INTO open_signals
    FROM public.signals
    WHERE user_id = user_uuid
    AND status = 'ACTIVE';
    
    -- Count total trades
    SELECT COUNT(*)
    INTO total_trades
    FROM public.trades
    WHERE user_id = user_uuid;
    
    -- Count winning trades
    SELECT COUNT(*)
    INTO winning_trades
    FROM public.trades
    WHERE user_id = user_uuid
    AND pnl > 0;
    
    -- Calculate win rate
    IF total_trades > 0 THEN
        win_rate := (winning_trades::DECIMAL / total_trades::DECIMAL) * 100;
    ELSE
        win_rate := 0;
    END IF;
    
    -- Get last deposit amount
    SELECT amount
    INTO last_deposit
    FROM public.transactions
    WHERE user_id = user_uuid
    AND type = 'DEPOSIT'
    AND status = 'COMPLETED'
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN json_build_object(
        'balance', balance,
        'pnlToday', pnl_today,
        'openSignals', open_signals,
        'totalTrades', total_trades,
        'winRate', ROUND(win_rate, 2),
        'lastDeposit', COALESCE(last_deposit, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;