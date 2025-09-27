-- =====================================================
-- ZIGNAL - Admin Setup Migration
-- Created: 2025-09-15
-- Description: Set up admin roles and admin@zignals.org user
-- =====================================================

-- Add admin role column to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Add admin status tracking
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}';

-- Create admin permissions enum-like constraints
COMMENT ON COLUMN public.user_profiles.admin_permissions IS 'Array of admin permissions: ["users", "signals", "finances", "payments", "system"]';

-- =====================================================
-- Admin User Setup Function
-- =====================================================
CREATE OR REPLACE FUNCTION setup_admin_user(admin_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        -- If user doesn't exist, create a placeholder profile
        -- Note: The actual auth user must be created through Supabase Auth
        RAISE NOTICE 'Admin user % not found in auth.users. Create the user through Supabase Auth first.', admin_email;
        RETURN;
    END IF;
    
    -- Update or insert admin profile
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        display_name,
        role,
        is_admin,
        admin_permissions,
        updated_at
    ) VALUES (
        admin_user_id,
        admin_email,
        'Zignals Administrator',
        'Admin',
        'admin',
        true,
        ARRAY['users', 'signals', 'finances', 'payments', 'system'],
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        is_admin = true,
        admin_permissions = ARRAY['users', 'signals', 'finances', 'payments', 'system'],
        updated_at = NOW();
        
    RAISE NOTICE 'Admin user % has been set up with full permissions', admin_email;
END;
$$;

-- =====================================================
-- Admin Statistics Views
-- =====================================================

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_member_stats AS
SELECT
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as active_members,
    COUNT(*) FILTER (WHERE last_sign_in_at IS NULL OR last_sign_in_at <= NOW() - INTERVAL '30 days') as inactive_members,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_members_week,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as new_members_today
FROM public.user_profiles
WHERE role != 'admin';

-- Create view for trading statistics
CREATE OR REPLACE VIEW admin_trading_stats AS
SELECT
    COUNT(*) as total_signals,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as active_signals,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as signals_today,
    AVG(confidence) as avg_confidence
FROM public.trading_signals;

-- Create view for financial statistics (placeholder for when financial tables exist)
CREATE OR REPLACE VIEW admin_financial_stats AS
SELECT
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN status = 'completed' AND created_at > NOW() - INTERVAL '1 day' THEN amount END), 0) as deposits_today,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_withdrawals,
    COALESCE(COUNT(*) FILTER (WHERE status = 'pending'), 0) as pending_withdrawals
FROM (
    -- Union placeholder queries - replace with actual financial tables when available
    SELECT 0::decimal as amount, 'completed'::text as status, NOW() as created_at WHERE false
) as financial_data;

-- =====================================================
-- Row Level Security for Admin Access
-- =====================================================

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin can see all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
    );

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
    );

-- =====================================================
-- Setup Admin User
-- =====================================================

-- Note: The actual auth user must be created first through Supabase Auth
-- This will set up the profile once the auth user exists
-- You can run: SELECT setup_admin_user('admin@zignals.org'); 
-- after creating the user in Supabase Auth

COMMENT ON FUNCTION setup_admin_user IS 'Sets up admin permissions for a user. The auth user must exist first.';

-- =====================================================
-- Admin Activity Log Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'user', 'signal', 'finance', etc.
    target_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for admin activity queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON public.admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON public.admin_activity_log(action);

-- Enable RLS on admin activity log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin activity
CREATE POLICY "Admins can view admin activity" ON public.admin_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
    );

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    action_text TEXT,
    target_type_text TEXT DEFAULT NULL,
    target_id_text TEXT DEFAULT NULL,
    details_json JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_activity_log (
        admin_user_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        action_text,
        target_type_text,
        target_id_text,
        details_json
    );
END;
$$;