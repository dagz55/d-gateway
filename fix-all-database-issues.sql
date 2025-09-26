-- COMPREHENSIVE DATABASE FIX - ALL ISSUES
-- Run this in Supabase SQL Editor

-- STEP 1: Drop ALL policies to prevent infinite recursion
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
    END LOOP;
    RAISE NOTICE 'Dropped all RLS policies to prevent recursion';
END $$;

-- STEP 2: Drop ALL foreign key constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT 
            tc.constraint_name,
            tc.table_name,
            tc.table_schema
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
            constraint_record.table_schema,
            constraint_record.table_name,
            constraint_record.constraint_name);
    END LOOP;
    RAISE NOTICE 'Dropped all foreign key constraints';
END $$;

-- STEP 3: Add ALL missing columns based on error logs
-- token_families table
ALTER TABLE public.token_families 
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS token_chain TEXT;

-- user_sessions table
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS location_data JSONB;

-- user_devices table
ALTER TABLE public.user_devices 
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';

-- STEP 4: Change ALL user_id columns to TEXT (for WorkOS compatibility)
-- Handle all tables that might have user_id columns
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT DISTINCT table_name, column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type = 'uuid'
        AND (
            column_name = 'user_id'
            OR column_name = 'signal_provider_id'
            OR column_name = 'created_by'
            OR column_name = 'owner_id'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE TEXT',
            table_record.table_name,
            table_record.column_name);
        RAISE NOTICE 'Updated %.% to TEXT', table_record.table_name, table_record.column_name;
    END LOOP;
END $$;

-- STEP 5: Add clerk_user_id column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- STEP 6: Create SIMPLE, NON-RECURSIVE policies
-- User profiles - SIMPLE policies without self-references
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT USING (
        user_id = auth.uid()::text 
        OR clerk_user_id = auth.uid()::text
    );

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text 
        OR clerk_user_id = auth.uid()::text
    );

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE USING (
        user_id = auth.uid()::text 
        OR clerk_user_id = auth.uid()::text
    );

-- Token families - direct user_id check only
CREATE POLICY "token_families_all" ON public.token_families
    FOR ALL USING (user_id = auth.uid()::text);

-- User sessions - direct user_id check only
CREATE POLICY "user_sessions_all" ON public.user_sessions
    FOR ALL USING (user_id = auth.uid()::text);

-- User devices - direct user_id check only
CREATE POLICY "user_devices_all" ON public.user_devices
    FOR ALL USING (user_id = auth.uid()::text);

-- Refresh tokens - direct user_id check only
CREATE POLICY "refresh_tokens_all" ON public.refresh_tokens
    FOR ALL USING (user_id = auth.uid()::text);

-- Other tables with user_id - simple policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades' AND table_schema = 'public') THEN
        CREATE POLICY "trades_all" ON public.trades
            FOR ALL USING (user_id = auth.uid()::text);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signals' AND table_schema = 'public') THEN
        CREATE POLICY "signals_all" ON public.signals
            FOR ALL USING (user_id = auth.uid()::text);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
        CREATE POLICY "transactions_all" ON public.transactions
            FOR ALL USING (user_id = auth.uid()::text);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trading_signals' AND table_schema = 'public') THEN
        CREATE POLICY "trading_signals_all" ON public.trading_signals
            FOR ALL USING (signal_provider_id = auth.uid()::text);
    END IF;
END $$;

-- STEP 7: Create separate admin policies (avoid recursion)
-- Admin check function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE (user_id = user_uuid OR clerk_user_id = user_uuid)
        AND is_admin = true
    );
$$;

-- Admin policies using the function
CREATE POLICY "admin_user_profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin(auth.uid()::text));

CREATE POLICY "admin_token_families" ON public.token_families
    FOR ALL USING (public.is_admin(auth.uid()::text));

CREATE POLICY "admin_user_sessions" ON public.user_sessions
    FOR ALL USING (public.is_admin(auth.uid()::text));

CREATE POLICY "admin_user_devices" ON public.user_devices
    FOR ALL USING (public.is_admin(auth.uid()::text));

CREATE POLICY "admin_refresh_tokens" ON public.refresh_tokens
    FOR ALL USING (public.is_admin(auth.uid()::text));

-- STEP 8: Grant permissions
GRANT ALL ON public.user_profiles TO authenticated, service_role;
GRANT ALL ON public.token_families TO authenticated, service_role;
GRANT ALL ON public.user_sessions TO authenticated, service_role;
GRANT ALL ON public.user_devices TO authenticated, service_role;
GRANT ALL ON public.refresh_tokens TO authenticated, service_role;

-- STEP 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_token_families_user_id ON public.token_families(user_id);
CREATE INDEX IF NOT EXISTS idx_token_families_last_used ON public.token_families(last_used);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_fingerprint ON public.user_sessions(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);

-- STEP 10: Add helpful comments
COMMENT ON COLUMN public.user_profiles.user_id IS 'User ID - Supabase UUID or Clerk user ID string';
COMMENT ON COLUMN public.user_profiles.clerk_user_id IS 'Clerk user ID for authentication';
COMMENT ON COLUMN public.token_families.last_used IS 'Last token usage timestamp';
COMMENT ON COLUMN public.token_families.token_chain IS 'Token chain for rotation tracking';
COMMENT ON COLUMN public.user_sessions.device_fingerprint IS 'Device fingerprint for security';
COMMENT ON COLUMN public.user_sessions.location_data IS 'Location data as JSON';
COMMENT ON COLUMN public.user_devices.browser IS 'Browser information';
COMMENT ON COLUMN public.user_devices.os IS 'Operating system';
COMMENT ON COLUMN public.user_devices.device_type IS 'Device type (desktop/mobile/tablet)';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE MIGRATION COMPLETED ===';
    RAISE NOTICE '✅ All missing columns added';
    RAISE NOTICE '✅ All user_id columns converted to TEXT';
    RAISE NOTICE '✅ All foreign key constraints removed';
    RAISE NOTICE '✅ Simple, non-recursive RLS policies created';
    RAISE NOTICE '✅ Admin function created to avoid policy recursion';
    RAISE NOTICE '✅ Performance indexes added';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 RESTART YOUR APPLICATION SERVER NOW';
    RAISE NOTICE '   The schema cache needs to be cleared';
END $$;
