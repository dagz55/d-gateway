-- Fix admin email and resolve UUID type mismatch in trigger
-- Run this in your Supabase SQL Editor

-- Step 1: Fix the trigger function that's causing the UUID type mismatch
CREATE OR REPLACE FUNCTION public.auto_set_admin_for_known_emails()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the email is in the known admin emails list
    IF NEW.email IN ('admin@zignals.org', 'admin@zignal.dev', 'dagz55@gmail.com') THEN
        -- Update the user profile to set admin status
        UPDATE public.user_profiles
        SET
            is_admin = true,
            role = 'admin',
            updated_at = NOW()
        WHERE user_id::text = NEW.id::text OR clerk_user_id::text = NEW.id::text;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Now update the admin email
UPDATE user_profiles 
SET 
    email = 'admin@zignals.org',
    updated_at = NOW()
WHERE email = 'admin@zignal.dev';

-- Step 3: Verify the update
SELECT 
    id,
    email,
    username,
    full_name,
    role,
    is_admin,
    created_at,
    updated_at
FROM user_profiles 
WHERE email = 'admin@zignals.org';

-- Step 4: Check all admin accounts
SELECT 
    id,
    email,
    username,
    full_name,
    role,
    is_admin
FROM user_profiles 
WHERE role = 'admin' OR is_admin = true
ORDER BY created_at;
