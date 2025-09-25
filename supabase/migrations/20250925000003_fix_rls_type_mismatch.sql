-- =====================================================
-- ZIGNAL - Fix RLS Type Mismatch
-- Created: 2025-09-25
-- Description: Fix UUID type mismatch in RLS policies
-- Migration: 20250925000003_fix_rls_type_mismatch.sql
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Recreate policies with proper type casting
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add comment
COMMENT ON SCHEMA public IS 'Fixed RLS type mismatch on 2025-09-25';
