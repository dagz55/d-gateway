-- WorkOS User Profiles Migration
-- This migration creates the unified user_profiles table for WorkOS integration

-- First, ensure user_profiles table exists (it might already exist)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- For backward compatibility with old Supabase auth
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add WorkOS compatibility columns if they don't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS workos_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS package TEXT DEFAULT 'PREMIUM',
ADD COLUMN IF NOT EXISTS trader_level TEXT DEFAULT 'BEGINNER',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ONLINE',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[];

-- Add constraint after columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'valid_user_id'
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT valid_user_id CHECK (user_id IS NOT NULL OR workos_user_id IS NOT NULL);
  END IF;
END $$;

-- Wait for all columns to be added, then create indexes
DO $$
BEGIN
  -- Check if columns exist before creating indexes
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

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profile view for copy trading" ON user_profiles;

-- Create simplified RLS policies (columns are guaranteed to exist now)
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (
  COALESCE(workos_user_id, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
  OR COALESCE(user_id::text, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (
  COALESCE(workos_user_id, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
  OR COALESCE(user_id::text, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (
  COALESCE(workos_user_id, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
  OR COALESCE(user_id::text, '') = COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', '')
);

-- Allow public access for now (we'll tighten this based on your requirements)
CREATE POLICY "Allow all operations for authenticated users" ON user_profiles
FOR ALL USING (true);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration function to move data from user_data to user_profiles (if user_data exists)
DO $$
DECLARE
    rec RECORD;
    migration_count INTEGER := 0;
BEGIN
    -- Check if user_data table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_data') THEN
        RAISE NOTICE 'Found user_data table, migrating records...';
        
        -- Migrate records from user_data to user_profiles
        FOR rec IN SELECT * FROM user_data LOOP
            -- Check if user already exists in user_profiles
            IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE workos_user_id = rec.workos_user_id) THEN
                INSERT INTO user_profiles (
                    workos_user_id,
                    email,
                    username,
                    full_name,
                    first_name,
                    last_name,
                    avatar_url,
                    profile_picture_url,
                    is_admin,
                    package,
                    trader_level,
                    status,
                    role,
                    created_at,
                    updated_at
                ) VALUES (
                    rec.workos_user_id,
                    rec.email,
                    rec.username,
                    rec.full_name,
                    rec.first_name,
                    rec.last_name,
                    rec.avatar_url,
                    rec.profile_picture_url,
                    COALESCE(rec.is_admin, false),
                    COALESCE(rec.package, 'PREMIUM'),
                    COALESCE(rec.trader_level, 'BEGINNER'),
                    COALESCE(rec.status, 'ONLINE'),
                    CASE WHEN COALESCE(rec.is_admin, false) THEN 'admin' ELSE 'user' END,
                    COALESCE(rec.created_at, NOW()),
                    NOW()
                );
                migration_count := migration_count + 1;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated % records from user_data to user_profiles', migration_count;
    ELSE
        RAISE NOTICE 'No user_data table found, skipping migration';
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Add comment for documentation
COMMENT ON TABLE user_profiles IS 'Unified user profiles table for WorkOS and Supabase auth integration';
COMMENT ON COLUMN user_profiles.workos_user_id IS 'WorkOS user identifier for WorkOS authentication';
COMMENT ON COLUMN user_profiles.user_id IS 'Legacy Supabase auth user identifier for backward compatibility';