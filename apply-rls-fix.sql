-- =====================================================
-- ZIGNAL - Fix User Profiles RLS Policies
-- Created: 2025-09-25
-- Description: Fix RLS policies for user_profiles table to resolve Clerk integration issues
-- =====================================================

-- First, let's ensure the user_profiles table has the correct structure
-- Add clerk_user_id column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Create index for better performance on clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id 
ON public.user_profiles(clerk_user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profile view for copy trading" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;

-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR USER_PROFILES
-- =====================================================

-- 1. Users can view their own profile (by user_id or clerk_user_id)
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (
        auth.uid()::text = user_id::text
        OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
    );

-- 2. Users can update their own profile (by user_id or clerk_user_id)
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (
        auth.uid()::text = user_id::text
        OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
    );

-- 3. Users can insert their own profile (by user_id or clerk_user_id)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text
        OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
    );

-- 4. Users can delete their own profile (by user_id or clerk_user_id)
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (
        auth.uid()::text = user_id::text
        OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
    );

-- 5. Public profile viewing for copy trading (limited fields)
CREATE POLICY "Public profile view for copy trading" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Service role can manage all profiles (for system operations)
CREATE POLICY "Service role can manage profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE (up.user_id::text = auth.uid()::text OR up.clerk_user_id = auth.uid()::text)
            AND up.is_admin = true
        )
    );

-- =====================================================
-- HELPER FUNCTIONS FOR CLERK INTEGRATION
-- =====================================================

-- Function to get user profile by Clerk ID
CREATE OR REPLACE FUNCTION public.get_user_profile_by_clerk_id(clerk_id TEXT)
RETURNS SETOF public.user_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_profiles 
    WHERE clerk_user_id = clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert user profile by Clerk ID
CREATE OR REPLACE FUNCTION public.upsert_user_profile_by_clerk_id(
    clerk_id TEXT,
    profile_data JSONB
)
RETURNS public.user_profiles AS $$
DECLARE
    result_profile public.user_profiles;
BEGIN
    -- Try to update first
    UPDATE public.user_profiles 
    SET 
        email = COALESCE(profile_data->>'email', email),
        username = COALESCE(profile_data->>'username', username),
        full_name = COALESCE(profile_data->>'full_name', full_name),
        first_name = COALESCE(profile_data->>'first_name', first_name),
        last_name = COALESCE(profile_data->>'last_name', last_name),
        avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
        bio = COALESCE(profile_data->>'bio', bio),
        phone = COALESCE(profile_data->>'phone', phone),
        country = COALESCE(profile_data->>'country', country),
        timezone = COALESCE(profile_data->>'timezone', timezone),
        language = COALESCE(profile_data->>'language', language),
        package = COALESCE(profile_data->>'package', package),
        trader_level = COALESCE(profile_data->>'trader_level', trader_level),
        is_admin = COALESCE((profile_data->>'is_admin')::boolean, is_admin),
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id
    RETURNING * INTO result_profile;
    
    -- If no update occurred, insert new profile
    IF NOT FOUND THEN
        INSERT INTO public.user_profiles (
            user_id,
            clerk_user_id,
            email,
            username,
            full_name,
            first_name,
            last_name,
            avatar_url,
            bio,
            phone,
            country,
            timezone,
            language,
            package,
            trader_level,
            is_admin,
            created_at,
            updated_at
        ) VALUES (
            COALESCE(profile_data->>'user_id', gen_random_uuid()::text),
            clerk_id,
            profile_data->>'email',
            profile_data->>'username',
            profile_data->>'full_name',
            profile_data->>'first_name',
            profile_data->>'last_name',
            profile_data->>'avatar_url',
            profile_data->>'bio',
            profile_data->>'phone',
            profile_data->>'country',
            profile_data->>'timezone',
            profile_data->>'language',
            profile_data->>'package',
            profile_data->>'trader_level',
            COALESCE((profile_data->>'is_admin')::boolean, false),
            NOW(),
            NOW()
        )
        RETURNING * INTO result_profile;
    END IF;
    
    RETURN result_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.user_profiles TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_clerk_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile_by_clerk_id(TEXT, JSONB) TO authenticated;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_clerk_id(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile_by_clerk_id(TEXT, JSONB) TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add a comment to track completion
COMMENT ON TABLE public.user_profiles IS 'RLS policies fixed on 2025-09-25 - Comprehensive Clerk integration support';
