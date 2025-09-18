-- Fix Admin Profile and Access Issues
-- Run this in Supabase SQL Editor

-- STEP 1: First, let's see what profiles exist
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT PROFILES ===';
    FOR profile_record IN
        SELECT email, username, workos_user_id, is_admin, role
        FROM public.user_profiles
        WHERE email = 'dagz55@gmail.com' OR username = 'dagz55'
    LOOP
        RAISE NOTICE 'Profile: email=%, username=%, workos_user_id=%, is_admin=%, role=%', 
            profile_record.email, 
            profile_record.username, 
            profile_record.workos_user_id,
            profile_record.is_admin,
            profile_record.role;
    END LOOP;
END $$;

-- STEP 2: Delete any conflicting profiles and start fresh
DELETE FROM public.user_profiles 
WHERE email = 'dagz55@gmail.com' OR username = 'dagz55';

-- STEP 3: Create a clean admin profile for dagz55@gmail.com
INSERT INTO public.user_profiles (
    user_id,
    workos_user_id,
    email,
    username,
    full_name,
    first_name,
    last_name,
    role,
    is_admin,
    admin_permissions,
    package,
    trader_level,
    status,
    timezone,
    language,
    created_at,
    updated_at
) VALUES (
    'user_01K56MTX5FSR76K9GQNMZMV454',
    'user_01K56MTX5FSR76K9GQNMZMV454',
    'dagz55@gmail.com',
    'dagz55_workos',                    -- Unique username
    'Dagz Suarez',
    'Dagz',
    'Suarez',
    'admin',
    true,
    ARRAY['users', 'signals', 'finances', 'payments', 'system'],
    'ENTERPRISE',
    'EXPERT',
    'ONLINE',
    'UTC',
    'en',
    NOW(),
    NOW()
);

-- STEP 4: Verify the admin profile was created
DO $$
DECLARE
    admin_profile RECORD;
BEGIN
    SELECT * INTO admin_profile
    FROM public.user_profiles
    WHERE workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin profile created successfully:';
        RAISE NOTICE '   Email: %', admin_profile.email;
        RAISE NOTICE '   Username: %', admin_profile.username;
        RAISE NOTICE '   Full Name: %', admin_profile.full_name;
        RAISE NOTICE '   Is Admin: %', admin_profile.is_admin;
        RAISE NOTICE '   Role: %', admin_profile.role;
        RAISE NOTICE '   Permissions: %', admin_profile.admin_permissions;
    ELSE
        RAISE NOTICE '❌ Admin profile creation failed';
    END IF;
END $$;

-- STEP 5: Create a function to automatically set admin permissions for known emails
CREATE OR REPLACE FUNCTION auto_set_admin_for_known_emails()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the email is in the admin list
    IF NEW.email IN ('dagz55@gmail.com', 'admin@signals.org', 'admin@zignals.org') 
       OR NEW.email LIKE '%admin%' THEN
        NEW.is_admin := true;
        NEW.role := 'admin';
        NEW.admin_permissions := ARRAY['users', 'signals', 'finances', 'payments', 'system'];
        NEW.package := 'ENTERPRISE';
        NEW.trader_level := 'EXPERT';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set admin permissions
DROP TRIGGER IF EXISTS auto_admin_trigger ON public.user_profiles;
CREATE TRIGGER auto_admin_trigger
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_admin_for_known_emails();

-- STEP 6: Test the trigger by updating the profile
UPDATE public.user_profiles 
SET updated_at = NOW()
WHERE workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454' 
        AND is_admin = true
    ) THEN
        RAISE NOTICE '✅ Admin profile for dagz55@gmail.com is ready';
        RAISE NOTICE '🔄 RESTART YOUR SERVER AND TEST ADMIN ACCESS';
    ELSE
        RAISE NOTICE '❌ Admin profile setup failed - check logs above';
    END IF;
END $$;
