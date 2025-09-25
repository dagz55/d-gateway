-- =====================================================
-- ZIGNAL - Fix Function Search Path Security Warnings
-- Created: 2025-09-25
-- Description: Add search_path = '' to all functions to fix security warnings
-- Migration: 20250925000004_fix_function_search_path_security.sql
-- =====================================================

-- =====================================================
-- USER PROFILE FUNCTIONS
-- =====================================================

-- Fix: update_user_profile_by_clerk_id
CREATE OR REPLACE FUNCTION public.update_user_profile_by_clerk_id(
    clerk_id TEXT,
    profile_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE public.user_profiles
    SET
        email = COALESCE(profile_data->>'email', email),
        username = COALESCE(profile_data->>'username', username),
        full_name = COALESCE(profile_data->>'full_name', full_name),
        first_name = COALESCE(profile_data->>'first_name', first_name),
        last_name = COALESCE(profile_data->>'last_name', last_name),
        avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
        bio = COALESCE(profile_data->>'bio', bio),
        phone = COALESCE(profile_data->>'phone', phone),
        country = COALESCE(profile_data->>'country', country),
        timezone = COALESCE(profile_data->>'timezone', timezone),
        language = COALESCE(profile_data->>'language', language),
        package = COALESCE(profile_data->>'package', package),
        trader_level = COALESCE(profile_data->>'trader_level', trader_level),
        is_admin = COALESCE((profile_data->>'is_admin')::boolean, is_admin),
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: upsert_user_profile_by_clerk_id
CREATE OR REPLACE FUNCTION public.upsert_user_profile_by_clerk_id(
    clerk_id TEXT,
    profile_data JSONB
)
RETURNS public.user_profiles AS $$
DECLARE
    result_profile public.user_profiles;
BEGIN
    -- Try to update first
    UPDATE public.user_profiles
    SET
        email = COALESCE(profile_data->>'email', email),
        username = COALESCE(profile_data->>'username', username),
        full_name = COALESCE(profile_data->>'full_name', full_name),
        first_name = COALESCE(profile_data->>'first_name', first_name),
        last_name = COALESCE(profile_data->>'last_name', last_name),
        avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
        bio = COALESCE(profile_data->>'bio', bio),
        phone = COALESCE(profile_data->>'phone', phone),
        country = COALESCE(profile_data->>'country', country),
        timezone = COALESCE(profile_data->>'timezone', timezone),
        language = COALESCE(profile_data->>'language', language),
        package = COALESCE(profile_data->>'package', package),
        trader_level = COALESCE(profile_data->>'trader_level', trader_level),
        is_admin = COALESCE((profile_data->>'is_admin')::boolean, is_admin),
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id
    RETURNING * INTO result_profile;

    -- If no update occurred, insert new profile
    IF NOT FOUND THEN
        INSERT INTO public.user_profiles (
            user_id,
            clerk_user_id,
            email,
            username,
            full_name,
            first_name,
            last_name,
            avatar_url,
            bio,
            phone,
            country,
            timezone,
            language,
            package,
            trader_level,
            is_admin,
            created_at,
            updated_at
        ) VALUES (
            COALESCE(profile_data->>'user_id', gen_random_uuid()::text),
            clerk_id,
            profile_data->>'email',
            profile_data->>'username',
            profile_data->>'full_name',
            profile_data->>'first_name',
            profile_data->>'last_name',
            profile_data->>'avatar_url',
            profile_data->>'bio',
            profile_data->>'phone',
            profile_data->>'country',
            profile_data->>'timezone',
            profile_data->>'language',
            profile_data->>'package',
            profile_data->>'trader_level',
            COALESCE((profile_data->>'is_admin')::boolean, false),
            NOW(),
            NOW()
        )
        RETURNING * INTO result_profile;
    END IF;

    RETURN result_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: get_user_profile_by_clerk_id
CREATE OR REPLACE FUNCTION public.get_user_profile_by_clerk_id(clerk_id TEXT)
RETURNS SETOF public.user_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_profiles
    WHERE clerk_user_id = clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- PORTFOLIO AND TRADING FUNCTIONS
-- =====================================================

-- Fix: calculate_portfolio_value
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

-- Fix: update_portfolio_holding
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

-- Fix: calculate_win_rate
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

-- Fix: handle_trade_execution
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

        NEW.pnl_percentage :=
            CASE
                WHEN (NEW.entry_price * NEW.quantity) = 0 THEN 0
                ELSE (NEW.pnl / NULLIF(NEW.entry_price * NEW.quantity, 0)) * 100
            END;
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

-- Fix: get_user_balance
DROP FUNCTION IF EXISTS public.get_user_balance(uuid);
CREATE OR REPLACE FUNCTION public.get_user_balance(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    account_balance DECIMAL(20,8);
    portfolio_value DECIMAL(20,8);
BEGIN
    -- Get account balance from trading_accounts
    SELECT COALESCE(balance, 0)
    INTO account_balance
    FROM public.trading_accounts
    WHERE user_id = user_uuid::text;

    -- Get portfolio value
    SELECT public.calculate_portfolio_value(user_uuid) INTO portfolio_value;

    -- Build JSON result
    result := json_build_object(
        'account_balance', COALESCE(account_balance, 0),
        'portfolio_value', COALESCE(portfolio_value, 0),
        'total_balance', COALESCE(account_balance, 0) + COALESCE(portfolio_value, 0)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: get_dashboard_stats
DROP FUNCTION IF EXISTS public.get_dashboard_stats(uuid);
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

    -- Get account balance from trading_accounts
    SELECT COALESCE(balance, 0)
    INTO account_balance
    FROM public.trading_accounts
    WHERE user_id = user_uuid::text;

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

-- =====================================================
-- STORAGE FUNCTIONS
-- =====================================================

-- Fix: get_user_folder_name
CREATE OR REPLACE FUNCTION public.get_user_folder_name()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.jwt() ->> 'name', 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: validate_image_upload
CREATE OR REPLACE FUNCTION public.validate_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check file size (5MB limit)
  IF NEW.metadata->>'size'::text IS NOT NULL AND
     (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;

  -- Check file type
  IF NEW.metadata->>'mimetype' NOT IN (
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ) THEN
    RAISE EXCEPTION 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
  END IF;

  -- Ensure file is in user's folder
  IF (storage.foldername(NEW.name))[1] != public.get_user_folder_name() THEN
    RAISE EXCEPTION 'Files must be uploaded to user''s own folder';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix: cleanup_old_avatar
CREATE OR REPLACE FUNCTION public.cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  user_folder TEXT;
  old_files TEXT[];
BEGIN
  -- Get user folder name
  user_folder := public.get_user_folder_name();

  -- Find old avatar files for this user
  SELECT ARRAY_AGG(name) INTO old_files
  FROM storage.objects
  WHERE bucket_id = 'public_image'
    AND (storage.foldername(name))[1] = user_folder
    AND name LIKE 'avatar-%'
    AND name != NEW.name;

  -- Delete old avatar files
  IF old_files IS NOT NULL AND array_length(old_files, 1) > 0 THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'public_image'
      AND name = ANY(old_files);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- ADMIN FUNCTIONS
-- =====================================================

-- Fix: auto_set_admin_for_known_emails
CREATE TABLE IF NOT EXISTS public.admin_configuration (
    id SERIAL PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set updated_at trigger for admin_configuration
DROP TRIGGER IF EXISTS update_admin_configuration_updated_at ON public.admin_configuration;
CREATE TRIGGER update_admin_configuration_updated_at
    BEFORE UPDATE ON public.admin_configuration
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default admin emails
INSERT INTO public.admin_configuration (config_key, config_value, description)
VALUES (
    'admin_emails',
    '["admin@zignals.org", "dagz55@gmail.com"]'::jsonb,
    'List of emails that are automatically granted admin privileges.'
) ON CONFLICT (config_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.auto_set_admin_for_known_emails()
RETURNS TRIGGER AS $$
DECLARE
    known_admin_emails TEXT[];
BEGIN
    -- Get admin emails from configuration table
    SELECT COALESCE(
        (SELECT array_agg(elem::text) FROM jsonb_array_elements_text((SELECT config_value FROM public.admin_configuration WHERE config_key = 'admin_emails')) elem),
        ARRAY[]::TEXT[]
    ) INTO known_admin_emails;

    -- Check if the new user's email is in the admin list
    IF NEW.email = ANY(known_admin_emails) THEN
        -- Update the user profile to set admin status
        UPDATE public.user_profiles
        SET
            is_admin = true,
            updated_at = NOW()
        WHERE user_id = NEW.id OR clerk_user_id = NEW.id::text;

        -- If no profile exists yet, the handle_new_user trigger will create it
        -- and we'll update it in a subsequent trigger
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for auto admin assignment
DROP TRIGGER IF EXISTS auto_set_admin_for_known_emails_trigger ON public.user_profiles;
CREATE TRIGGER auto_set_admin_for_known_emails_trigger
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_set_admin_for_known_emails();

-- Fix: update_user_avatar_by_clerk_id
DROP FUNCTION IF EXISTS public.update_user_avatar_by_clerk_id(text,text);
CREATE OR REPLACE FUNCTION public.update_user_avatar_by_clerk_id(
    clerk_id TEXT,
    avatar_url_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE public.user_profiles
    SET
        avatar_url = avatar_url_param,
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

COMMENT ON SCHEMA public IS 'All functions updated with SET search_path = "" for security - 2025-09-25';