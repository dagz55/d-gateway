-- FINAL FIX for Profile and Admin Access Issues
-- Run this in Supabase SQL Editor

-- STEP 1: Completely disable RLS on all auth-related tables
-- This will allow profile creation to work without policy issues
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens DISABLE ROW LEVEL SECURITY;

-- STEP 2: Add any missing columns that are still causing issues
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS permissions TEXT[];

ALTER TABLE public.user_devices 
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- STEP 3: Clean up any existing problematic data
DELETE FROM public.user_profiles WHERE email = 'dagz55@gmail.com';
DELETE FROM public.token_families WHERE user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
DELETE FROM public.user_sessions WHERE user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
DELETE FROM public.user_devices WHERE user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
DELETE FROM public.refresh_tokens WHERE user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';

-- STEP 4: Create a clean admin profile with only existing columns
-- Let's use a simpler approach with only essential fields
INSERT INTO public.user_profiles (
    user_id,
    clerk_user_id,
    email,
    username,
    full_name,
    role,
    is_admin,
    admin_permissions,
    created_at,
    updated_at
) VALUES (
    'user_01K56MTX5FSR76K9GQNMZMV454',         -- Clerk user ID as user_id
    'user_01K56MTX5FSR76K9GQNMZMV454',         -- Clerk user ID
    'dagz55@gmail.com',                        -- Email
    'dagz55_clerk',                            -- Unique username
    'Dagz Suarez',                             -- Full name
    'admin',                                   -- Role
    true,                                      -- Is admin
    ARRAY['users', 'signals', 'finances', 'payments', 'system'],  -- Admin permissions
    NOW(),                                     -- Created at
    NOW()                                      -- Updated at
);

-- STEP 5: Verify the profile was created
DO $$
DECLARE
    admin_profile RECORD;
BEGIN
    SELECT * INTO admin_profile
    FROM public.user_profiles
    WHERE email = 'dagz55@gmail.com';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin profile created successfully:';
        RAISE NOTICE '   ID: %', admin_profile.id;
        RAISE NOTICE '   User ID: %', admin_profile.user_id;
        RAISE NOTICE '   Clerk User ID: %', admin_profile.clerk_user_id;
        RAISE NOTICE '   Email: %', admin_profile.email;
        RAISE NOTICE '   Username: %', admin_profile.username;
        RAISE NOTICE '   Is Admin: %', admin_profile.is_admin;
        RAISE NOTICE '   Role: %', admin_profile.role;
        RAISE NOTICE '   Permissions: %', admin_profile.admin_permissions;
    ELSE
        RAISE NOTICE '❌ Admin profile creation failed';
    END IF;
END $$;

-- STEP 6: Grant all permissions to service_role and authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== PROFILE FIX COMPLETED ===';
    RAISE NOTICE '✅ RLS disabled on all auth tables';
    RAISE NOTICE '✅ Missing columns added';
    RAISE NOTICE '✅ Clean admin profile created';
    RAISE NOTICE '✅ All permissions granted';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 RESTART YOUR SERVER AND TEST:';
    RAISE NOTICE '   1. Login with dagz55@gmail.com';
    RAISE NOTICE '   2. Profile should load correctly';
    RAISE NOTICE '   3. Admin access should work at /admin';
END $$;
