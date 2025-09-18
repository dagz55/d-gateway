-- Fix WorkOS user ID compatibility
-- Migration: 20250917000003_fix_workos_user_ids.sql

-- Update user_profiles table to handle WorkOS user IDs properly
-- WorkOS user IDs are strings like "user_01K5BKE952KZCY78E0RSJ08ATS", not UUIDs

-- First, check if we need to modify the user_id column type
DO $$
BEGIN
    -- Drop the conflicting policy before altering the column
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

    -- Check if user_id column exists and is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Change user_id from UUID to TEXT to accommodate WorkOS user IDs
        ALTER TABLE public.user_profiles 
        ALTER COLUMN user_id TYPE TEXT;
        
        RAISE NOTICE 'Changed user_profiles.user_id from UUID to TEXT for WorkOS compatibility';
    END IF;
    
    -- Ensure workos_user_id column exists and is TEXT
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'workos_user_id'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN workos_user_id TEXT;
        
        RAISE NOTICE 'Added workos_user_id column to user_profiles';
    END IF;
    
    -- Make sure workos_user_id is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'workos_user_id' 
        AND data_type != 'text'
    ) THEN
        ALTER TABLE public.user_profiles 
        ALTER COLUMN workos_user_id TYPE TEXT;
        
        RAISE NOTICE 'Changed workos_user_id to TEXT type';
    END IF;
END
$$;

-- Add unique constraint on workos_user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_workos_user_id_key'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_workos_user_id_key UNIQUE (workos_user_id);
        
        RAISE NOTICE 'Added unique constraint on workos_user_id';
    END IF;
END
$$;

-- Update token_families, user_sessions, user_devices to use TEXT for user_id
ALTER TABLE public.token_families 
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE public.user_sessions 
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE public.user_devices 
ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE public.refresh_tokens 
ALTER COLUMN user_id TYPE TEXT;

-- Update RLS policies to work with TEXT user_id instead of auth.uid()::text
-- We'll use workos_user_id for WorkOS users

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own token families" ON public.token_families;
DROP POLICY IF EXISTS "Users can insert own token families" ON public.token_families;
DROP POLICY IF EXISTS "Users can update own token families" ON public.token_families;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;

DROP POLICY IF EXISTS "Users can view own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can update own devices" ON public.user_devices;

DROP POLICY IF EXISTS "Users can view own refresh tokens" ON public.refresh_tokens;
DROP POLICY IF EXISTS "Users can insert own refresh tokens" ON public.refresh_tokens;
DROP POLICY IF EXISTS "Users can update own refresh tokens" ON public.refresh_tokens;

-- Create new policies that work with WorkOS user IDs
CREATE POLICY "Users can manage own token families" ON public.token_families
    FOR ALL USING (
        user_id = (
            SELECT workos_user_id FROM public.user_profiles 
            WHERE user_id = auth.uid()::text 
            OR workos_user_id = auth.uid()::text
            LIMIT 1
        )
    );

CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (
        user_id = (
            SELECT workos_user_id FROM public.user_profiles 
            WHERE user_id = auth.uid()::text 
            OR workos_user_id = auth.uid()::text
            LIMIT 1
        )
    );

CREATE POLICY "Users can manage own devices" ON public.user_devices
    FOR ALL USING (
        user_id = (
            SELECT workos_user_id FROM public.user_profiles 
            WHERE user_id = auth.uid()::text 
            OR workos_user_id = auth.uid()::text
            LIMIT 1
        )
    );

CREATE POLICY "Users can manage own refresh tokens" ON public.refresh_tokens
    FOR ALL USING (
        user_id = (
            SELECT workos_user_id FROM public.user_profiles 
            WHERE user_id = auth.uid()::text 
            OR workos_user_id = auth.uid()::text
            LIMIT 1
        )
    );

-- Admin policies remain the same
CREATE POLICY "Admins can manage all token families" ON public.token_families
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE (user_id = auth.uid()::text OR workos_user_id = auth.uid()::text)
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE (user_id = auth.uid()::text OR workos_user_id = auth.uid()::text)
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all user devices" ON public.user_devices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE (user_id = auth.uid()::text OR workos_user_id = auth.uid()::text)
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all refresh tokens" ON public.refresh_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE (user_id = auth.uid()::text OR workos_user_id = auth.uid()::text)
            AND is_admin = true
        )
    );

-- Add helpful comments
COMMENT ON TABLE public.token_families IS 'Manages refresh token families for secure token rotation';
COMMENT ON TABLE public.user_sessions IS 'Tracks user sessions with version management and device tracking';
COMMENT ON TABLE public.user_devices IS 'Manages trusted devices for enhanced security';
COMMENT ON TABLE public.refresh_tokens IS 'Stores refresh tokens with family-based invalidation';

-- Grant permissions
GRANT ALL ON public.token_families TO authenticated, service_role;
GRANT ALL ON public.user_sessions TO authenticated, service_role;
GRANT ALL ON public.user_devices TO authenticated, service_role;
GRANT ALL ON public.refresh_tokens TO authenticated, service_role;
