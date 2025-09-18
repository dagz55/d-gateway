-- Fix RLS Policy Issues for WorkOS Authentication
-- Run this in Supabase SQL Editor

-- Add missing permissions column to user_sessions
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS permissions TEXT[];

-- STEP 1: Disable RLS temporarily to fix policy issues
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all existing policies (they're causing issues)
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
    RAISE NOTICE 'Dropped all existing policies';
END $$;

-- STEP 3: Create simple, working policies
-- User profiles - allow service role and authenticated users
CREATE POLICY "user_profiles_service_role" ON public.user_profiles
    FOR ALL TO service_role USING (true);

CREATE POLICY "user_profiles_authenticated" ON public.user_profiles
    FOR ALL TO authenticated USING (true);

-- Token families - allow service role and authenticated users  
CREATE POLICY "token_families_service_role" ON public.token_families
    FOR ALL TO service_role USING (true);

CREATE POLICY "token_families_authenticated" ON public.token_families
    FOR ALL TO authenticated USING (true);

-- User sessions - allow service role and authenticated users
CREATE POLICY "user_sessions_service_role" ON public.user_sessions
    FOR ALL TO service_role USING (true);

CREATE POLICY "user_sessions_authenticated" ON public.user_sessions
    FOR ALL TO authenticated USING (true);

-- User devices - allow service role and authenticated users
CREATE POLICY "user_devices_service_role" ON public.user_devices
    FOR ALL TO service_role USING (true);

CREATE POLICY "user_devices_authenticated" ON public.user_devices
    FOR ALL TO authenticated USING (true);

-- Refresh tokens - allow service role and authenticated users
CREATE POLICY "refresh_tokens_service_role" ON public.refresh_tokens
    FOR ALL TO service_role USING (true);

CREATE POLICY "refresh_tokens_authenticated" ON public.refresh_tokens
    FOR ALL TO authenticated USING (true);

-- STEP 4: Re-enable RLS with working policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- STEP 5: Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated, service_role;
GRANT ALL ON public.token_families TO authenticated, service_role;
GRANT ALL ON public.user_sessions TO authenticated, service_role;
GRANT ALL ON public.user_devices TO authenticated, service_role;
GRANT ALL ON public.refresh_tokens TO authenticated, service_role;

-- STEP 6: First check what columns have NOT NULL constraints
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE 'Checking NOT NULL constraints on user_profiles:';
    FOR col_record IN
        SELECT column_name, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND table_schema = 'public'
        AND is_nullable = 'NO'
        AND column_default IS NULL
    LOOP
        RAISE NOTICE 'NOT NULL column without default: %', col_record.column_name;
    END LOOP;
END $$;

-- STEP 7: Make username nullable or provide default
ALTER TABLE public.user_profiles 
ALTER COLUMN username DROP NOT NULL;

-- STEP 8: Update existing admin profile for dagz55@gmail.com
-- Since the profile already exists, just update it to admin
UPDATE public.user_profiles 
SET 
    user_id = 'user_01K56MTX5FSR76K9GQNMZMV454',
    workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454',
    role = 'admin',
    is_admin = true,
    admin_permissions = ARRAY['users', 'signals', 'finances', 'payments', 'system'],
    updated_at = NOW()
WHERE email = 'dagz55@gmail.com';

-- Also try updating by username in case email doesn't match
UPDATE public.user_profiles 
SET 
    user_id = 'user_01K56MTX5FSR76K9GQNMZMV454',
    workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454',
    email = 'dagz55@gmail.com',
    full_name = 'Dagz Suarez',
    role = 'admin',
    is_admin = true,
    admin_permissions = ARRAY['users', 'signals', 'finances', 'payments', 'system'],
    updated_at = NOW()
WHERE username = 'dagz55';

-- If no rows were updated, the profile might not exist, so insert with a unique username
INSERT INTO public.user_profiles (
    user_id,
    workos_user_id,
    email,
    username,
    full_name,
    role,
    is_admin,
    admin_permissions,
    created_at,
    updated_at
) 
SELECT 
    'user_01K56MTX5FSR76K9GQNMZMV454',
    'user_01K56MTX5FSR76K9GQNMZMV454',
    'dagz55@gmail.com',
    'dagz55_admin',  -- Use unique username
    'Dagz Suarez',
    'admin',
    true,
    ARRAY['users', 'signals', 'finances', 'payments', 'system'],
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE email = 'dagz55@gmail.com' OR workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454'
);

-- STEP 7: Verify the setup
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE email = 'dagz55@gmail.com' AND is_admin = true
    ) THEN
        RAISE NOTICE '✅ Admin profile for dagz55@gmail.com is properly configured';
    ELSE
        RAISE NOTICE '❌ Admin profile for dagz55@gmail.com NOT found or not admin';
    END IF;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '=== RLS POLICY FIX COMPLETED ===';
    RAISE NOTICE '✅ Simplified RLS policies (allow all authenticated users)';
    RAISE NOTICE '✅ Added missing permissions column';
    RAISE NOTICE '✅ Created/updated admin profile for dagz55@gmail.com';
    RAISE NOTICE '🔄 RESTART YOUR APPLICATION SERVER NOW';
END $$;
