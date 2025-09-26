-- Fix admin email from admin@zignal.dev to admin@zignals.org
-- Run this in your Supabase SQL Editor

-- First, check if admin@zignals.org already exists
SELECT * FROM user_profiles WHERE email = 'admin@zignals.org';

-- If it doesn't exist, update the existing admin@zignal.dev
UPDATE user_profiles 
SET 
    email = 'admin@zignals.org',
    updated_at = NOW()
WHERE email = 'admin@zignal.dev';

-- Verify the update
SELECT * FROM user_profiles WHERE email = 'admin@zignals.org';

-- If the above doesn't work, try this alternative approach:
-- Delete the old admin@zignal.dev and create new admin@zignals.org
-- (Uncomment the lines below if needed)

-- DELETE FROM user_profiles WHERE email = 'admin@zignal.dev';

-- INSERT INTO user_profiles (
--     email,
--     username,
--     full_name,
--     role,
--     is_admin,
--     account_balance,
--     is_verified,
--     package,
--     status,
--     timezone,
--     language,
--     trader_level,
--     age,
--     gender,
--     created_at,
--     updated_at
-- ) VALUES (
--     'admin@zignals.org',
--     'admin',
--     'Admin Zignals',
--     'admin',
--     true,
--     0,
--     true,
--     'PREMIUM',
--     'ONLINE',
--     'UTC',
--     'en',
--     'EXPERT',
--     30,
--     'PREFER_NOT_TO_SAY',
--     NOW(),
--     NOW()
-- );
