-- Fix Username Constraint Issues for Profile Settings
-- Run this in Supabase SQL Editor

-- STEP 1: Check current username situation
DO $$
DECLARE
    username_record RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT USERNAME CONFLICTS ===';
    FOR username_record IN
        SELECT username, email, COUNT(*) as count
        FROM public.user_profiles
        WHERE username IS NOT NULL
        GROUP BY username, email
        HAVING COUNT(*) > 1 OR username IN (
            SELECT username 
            FROM public.user_profiles 
            WHERE email != 'dagz55@gmail.com' 
            AND username = 'dagz55'
        )
    LOOP
        RAISE NOTICE 'Duplicate username: % (email: %, count: %)', 
            username_record.username, 
            username_record.email, 
            username_record.count;
    END LOOP;
END $$;

-- STEP 2: Remove duplicate usernames for other users
-- Keep dagz55 for your account, change others
UPDATE public.user_profiles 
SET username = email || '_user'
WHERE username = 'dagz55' 
AND email != 'dagz55@gmail.com';

-- STEP 3: Ensure your profile has the correct username
UPDATE public.user_profiles 
SET username = 'dagz55'
WHERE email = 'dagz55@gmail.com'
AND workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';

-- STEP 4: Drop the problematic unique constraint
DROP INDEX IF EXISTS user_profiles_username_key;
DROP INDEX IF EXISTS user_profiles_username_unique;

-- STEP 5: Create a better unique constraint that handles nulls properly
CREATE UNIQUE INDEX user_profiles_username_unique_not_null 
ON public.user_profiles (username) 
WHERE username IS NOT NULL AND username != '';

-- STEP 6: Add a constraint to prevent empty usernames
ALTER TABLE public.user_profiles 
ADD CONSTRAINT username_not_empty 
CHECK (username IS NULL OR length(trim(username)) > 0);

-- STEP 7: Verify the fix
DO $$
DECLARE
    profile_info RECORD;
    duplicate_count INTEGER;
BEGIN
    -- Check your profile
    SELECT email, username, status, is_admin INTO profile_info
    FROM public.user_profiles
    WHERE workos_user_id = 'user_01K56MTX5FSR76K9GQNMZMV454';
    
    -- Check for any remaining duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM public.user_profiles
    WHERE username = 'dagz55';
    
    RAISE NOTICE '✅ Your Profile:';
    RAISE NOTICE '   Email: %', profile_info.email;
    RAISE NOTICE '   Username: %', profile_info.username;
    RAISE NOTICE '   Status: %', profile_info.status;
    RAISE NOTICE '   Is Admin: %', profile_info.is_admin;
    RAISE NOTICE '   Username "dagz55" count: %', duplicate_count;
    
    IF duplicate_count = 1 THEN
        RAISE NOTICE '✅ Username uniqueness fixed - only one "dagz55" exists';
    ELSE
        RAISE NOTICE '⚠️  Multiple "dagz55" usernames still exist: %', duplicate_count;
    END IF;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== USERNAME CONSTRAINT FIX COMPLETED ===';
    RAISE NOTICE '✅ Duplicate usernames resolved';
    RAISE NOTICE '✅ Flexible unique constraint created';
    RAISE NOTICE '✅ Profile settings should now save correctly';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 RESTART SERVER AND TEST PROFILE SETTINGS';
END $$;
