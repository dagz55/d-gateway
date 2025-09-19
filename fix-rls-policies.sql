-- =====================================================
-- Fix RLS Policies for Packages Table
-- This script fixes the admin access issues
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Only admins can manage packages" ON public.packages;
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Authenticated users can view all packages" ON public.packages;

-- =====================================================
-- NEW RLS POLICIES FOR PACKAGES TABLE
-- =====================================================

-- Anyone can view active packages
CREATE POLICY "Anyone can view active packages" ON public.packages
    FOR SELECT USING (active = true);

-- Authenticated users can view all packages (for admin purposes)
CREATE POLICY "Authenticated users can view all packages" ON public.packages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Simplified admin policy - check multiple possible admin locations
CREATE POLICY "Admin package management" ON public.packages
    FOR ALL USING (
        -- Check if user has admin role in Clerk session
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'org_role' = 'admin' OR
        (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin' OR
        
        -- Check profiles table (if exists and has is_admin column) - with type casting
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id::text = auth.uid()::text
            AND is_admin = true
        ) OR
        
        -- Check user_profiles table (if exists and has is_admin column) - with type casting
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id::text = auth.uid()::text
            AND is_admin = true
        )
    );

-- =====================================================
-- ALTERNATIVE: TEMPORARILY DISABLE RLS FOR TESTING
-- Uncomment the lines below if you want to temporarily disable RLS
-- =====================================================

-- ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'packages';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'packages';

-- Test current user context
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.jwt() ->> 'role' as jwt_role,
    auth.jwt() ->> 'org_role' as jwt_org_role,
    auth.jwt() -> 'public_metadata' ->> 'role' as jwt_public_metadata_role;