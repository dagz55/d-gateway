-- =====================================================
-- Add clerk_user_id column to user_profiles table
-- Created: 2025-09-20
-- Description: Add clerk_user_id for photo uploads and Clerk integration
-- =====================================================

-- Add clerk_user_id column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Create index for better performance on clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id 
ON public.user_profiles(clerk_user_id);

-- Add comment to document the purpose of the column
COMMENT ON COLUMN public.user_profiles.clerk_user_id 
IS 'Clerk user ID for authentication and photo upload management';

-- Update RLS policies to include clerk_user_id access patterns
-- Drop existing policies that might conflict or be superseded
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Recreate policies with clerk_user_id consideration
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
 FOR SELECT USING (
    auth.uid()::text = user_id::text
    OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
 FOR UPDATE USING (
    auth.uid()::text = user_id::text
    OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
 FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text
    OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
 FOR DELETE USING (
    auth.uid()::text = user_id::text
    OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
);

-- Update the handle_new_user function to include clerk_user_id from Clerk metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id, 
        email, 
        username, 
        full_name, 
        avatar_url,
        clerk_user_id
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username', 
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'clerk_user_id'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to find user profiles by clerk_user_id
CREATE OR REPLACE FUNCTION public.get_user_profile_by_clerk_id(clerk_id TEXT)
RETURNS SETOF public.user_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_profiles 
    WHERE clerk_user_id = clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user profile photo by clerk_user_id
CREATE OR REPLACE FUNCTION public.update_user_avatar_by_clerk_id(
    clerk_id TEXT,
    new_avatar_url TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE public.user_profiles 
    SET 
        avatar_url = new_avatar_url,
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_clerk_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_avatar_by_clerk_id(TEXT, TEXT) TO authenticated;

-- Add a trigger to automatically update the updated_at timestamp
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
