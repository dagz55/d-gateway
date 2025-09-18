
-- WorkOS Safe Migration - Step by step approach
-- This migration safely adds WorkOS compatibility to existing user_profiles table

-- Step 1: Ensure base table exists with minimal required columns
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add columns one by one with safe checks
DO $$ 
BEGIN
  -- Add user_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
    ALTER TABLE user_profiles ADD COLUMN user_id UUID;
  END IF;

  -- Add workos_user_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'workos_user_id') THEN
    ALTER TABLE user_profiles ADD COLUMN workos_user_id TEXT;
  END IF;

  -- Add username if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT;
  END IF;

  -- Add full_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE user_profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Add first_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'first_name') THEN
    ALTER TABLE user_profiles ADD COLUMN first_name TEXT;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_name') THEN
    ALTER TABLE user_profiles ADD COLUMN last_name TEXT;
  END IF;

  -- Add avatar_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add profile_picture_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'profile_picture_url') THEN
    ALTER TABLE user_profiles ADD COLUMN profile_picture_url TEXT;
  END IF;

  -- Add is_admin if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add package if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'package') THEN
    ALTER TABLE user_profiles ADD COLUMN package TEXT DEFAULT 'PREMIUM';
  END IF;

  -- Add trader_level if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'trader_level') THEN
    ALTER TABLE user_profiles ADD COLUMN trader_level TEXT DEFAULT 'BEGINNER';
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
    ALTER TABLE user_profiles ADD COLUMN status TEXT DEFAULT 'ONLINE';
  END IF;

  -- Add role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;

  -- Add admin_permissions if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'admin_permissions') THEN
    ALTER TABLE user_profiles ADD COLUMN admin_permissions TEXT[];
  END IF;
END $$;

-- Step 3: Add unique constraint on workos_user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_workos_user_id_key' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_workos_user_id_key UNIQUE (workos_user_id);
  END IF;
END $$;

-- Step 4: Create indexes only for columns that exist
DO $$ 
BEGIN
  -- Only create indexes for columns that actually exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'workos_user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_workos_user_id') THEN
      CREATE INDEX idx_user_profiles_workos_user_id ON user_profiles(workos_user_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_user_id') THEN
      CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_email') THEN
      CREATE INDEX idx_user_profiles_email ON user_profiles(email);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_username') THEN
      CREATE INDEX idx_user_profiles_username ON user_profiles(username);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_admin') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_is_admin') THEN
      CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);
    END IF;
  END IF;
END $$;
>>>>>>> REPLACE
</diff>
</apply_diff>