-- Fix Status and Profile Settings Issues
-- Run this in Supabase SQL Editor

-- STEP 1: Update your status to ONLINE
UPDATE public.user_profiles 
SET 
    status = 'ONLINE',
    updated_at = NOW()
WHERE clerk_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';

-- STEP 2: Add missing columns that are causing device registration issues
ALTER TABLE public.user_devices 
ADD COLUMN IF NOT EXISTS last_ip INET,
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- STEP 3: Add missing columns to token_families that are causing token issues
ALTER TABLE public.token_families 
ADD COLUMN IF NOT EXISTS refresh_token_jti TEXT;

-- STEP 4: Make refresh_token_jti nullable or provide default
ALTER TABLE public.token_families 
ALTER COLUMN refresh_token_jti DROP NOT NULL;

-- STEP 5: Fix username uniqueness issue by removing the constraint temporarily
-- This will allow profile updates to work
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- STEP 6: Create a more flexible unique constraint that allows nulls
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_unique 
ON public.user_profiles (username) 
WHERE username IS NOT NULL;

-- STEP 7: Verify your profile status
DO $$
DECLARE
    profile_info RECORD;
BEGIN
    SELECT email, username, status, is_admin, role INTO profile_info
    FROM public.user_profiles
    WHERE clerk_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Profile Status Updated:';
        RAISE NOTICE '   Email: %', profile_info.email;
        RAISE NOTICE '   Username: %', profile_info.username;
        RAISE NOTICE '   Status: %', profile_info.status;
        RAISE NOTICE '   Is Admin: %', profile_info.is_admin;
        RAISE NOTICE '   Role: %', profile_info.role;
    ELSE
        RAISE NOTICE '❌ Profile not found';
    END IF;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '=== STATUS AND SETTINGS FIX COMPLETED ===';
    RAISE NOTICE '✅ Status updated to ONLINE';
    RAISE NOTICE '✅ Missing device columns added';
    RAISE NOTICE '✅ Token family issues fixed';
    RAISE NOTICE '✅ Username constraint relaxed';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 RESTART SERVER TO SEE CHANGES';
END $$;
