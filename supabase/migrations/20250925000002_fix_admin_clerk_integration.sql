-- =====================================================
-- ZIGNAL - Fix Admin Clerk Integration
-- Created: 2025-09-25
-- Description: Fix admin users to work with Clerk authentication
-- Migration: 20250925000002_fix_admin_clerk_integration.sql
-- =====================================================

-- First, let's add a temporary column to track which admin users need Clerk IDs
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS needs_clerk_id BOOLEAN DEFAULT false;

-- Mark existing admin users as needing Clerk IDs
UPDATE public.user_profiles 
SET needs_clerk_id = true 
WHERE is_admin = true AND clerk_user_id IS NULL;

-- Create a function to help identify admin users by email
CREATE OR REPLACE FUNCTION public.get_admin_user_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    clerk_user_id TEXT,
    is_admin BOOLEAN,
    needs_clerk_id BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;
AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.clerk_user_id,
        up.is_admin,
        up.needs_clerk_id
    FROM public.user_profiles up
    WHERE up.email = user_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_admin_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_user_by_email(TEXT) TO service_role;

-- Update RLS policies to work with both Supabase auth and Clerk auth
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Create new comprehensive admin policies that work with both auth systems
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        -- Check if current user is admin via Supabase auth
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR
        -- Check if current user is admin via Clerk auth (using clerk_user_id)
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.clerk_user_id = auth.uid()::text
            AND admin_profile.is_admin = true
        )
        OR
        -- Service role can always access
        auth.role() = 'service_role'
    );

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        -- Check if current user is admin via Supabase auth
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR
        -- Check if current user is admin via Clerk auth (using clerk_user_id)
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.clerk_user_id = auth.uid()::text
            AND admin_profile.is_admin = true
        )
        OR
        -- Service role can always access
        auth.role() = 'service_role'
    );

CREATE POLICY "Admins can insert all profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (
        -- Check if current user is admin via Supabase auth
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR
        -- Check if current user is admin via Clerk auth (using clerk_user_id)
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.clerk_user_id = auth.uid()::text
            AND admin_profile.is_admin = true
        )
        OR
        -- Service role can always access
        auth.role() = 'service_role'
    );

CREATE POLICY "Admins can delete all profiles" ON public.user_profiles
    FOR DELETE USING (
        -- Check if current user is admin via Supabase auth
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR
        -- Check if current user is admin via Clerk auth (using clerk_user_id)
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.clerk_user_id = auth.uid()::text
            AND admin_profile.is_admin = true
        )
        OR
        -- Service role can always access
        auth.role() = 'service_role'
    );

-- Create a function to update admin user with Clerk ID
CREATE OR REPLACE FUNCTION public.update_admin_clerk_id(
    user_email TEXT,
    clerk_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;
AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE public.user_profiles
    SET
        clerk_user_id = update_admin_clerk_id.clerk_user_id,
        needs_clerk_id = false,
        updated_at = NOW()
    WHERE email = user_email
    AND is_admin = true;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    RETURN updated_rows > 0;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_admin_clerk_id(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_clerk_id(TEXT, TEXT) TO service_role;

-- Create a function to get admin users that need Clerk IDs
CREATE OR REPLACE FUNCTION public.get_admin_users_needing_clerk_ids()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    is_admin BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;
AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.full_name,
        up.is_admin
    FROM public.user_profiles up
    WHERE up.is_admin = true
    AND up.clerk_user_id IS NULL
    AND up.needs_clerk_id = true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_admin_users_needing_clerk_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_needing_clerk_ids() TO service_role;

-- Add a comment to track completion
COMMENT ON TABLE public.user_profiles IS 'Admin Clerk integration fixed on 2025-09-25 - RLS policies updated for both auth systems';

-- Add a comment to track the migration
COMMENT ON SCHEMA public IS 'Updated admin integration for Clerk authentication on 2025-09-25';
