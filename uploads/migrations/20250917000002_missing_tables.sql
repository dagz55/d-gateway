-- Create missing tables for token management and session tracking
-- Migration: 20250917000002_missing_tables.sql

-- Create token_families table for refresh token management
CREATE TABLE IF NOT EXISTS public.token_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    refresh_token_jti TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    session_version INTEGER DEFAULT 1,
    device_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    invalidated_at TIMESTAMPTZ,
    invalidation_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_devices table for device tracking
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT,
    browser_info TEXT,
    operating_system TEXT,
    ip_address TEXT,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create refresh_tokens table for token storage
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT UNIQUE NOT NULL,
    family_id TEXT NOT NULL REFERENCES public.token_families(family_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    access_token_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_families_user_id ON public.token_families(user_id);
CREATE INDEX IF NOT EXISTS idx_token_families_session_id ON public.token_families(session_id);
CREATE INDEX IF NOT EXISTS idx_token_families_expires_at ON public.token_families(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON public.user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_active ON public.user_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON public.refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id ON public.refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON public.refresh_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.token_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Token families: Users can only access their own token families
CREATE POLICY "Users can view own token families" ON public.token_families
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own token families" ON public.token_families
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own token families" ON public.token_families
    FOR UPDATE USING (user_id = auth.uid()::text);

-- User sessions: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (user_id = auth.uid()::text);

-- User devices: Users can only access their own devices
CREATE POLICY "Users can view own devices" ON public.user_devices
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own devices" ON public.user_devices
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own devices" ON public.user_devices
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Refresh tokens: Users can only access their own tokens
CREATE POLICY "Users can view own refresh tokens" ON public.refresh_tokens
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own refresh tokens" ON public.refresh_tokens
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own refresh tokens" ON public.refresh_tokens
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Admin policies for all tables
CREATE POLICY "Admins can manage all token families" ON public.token_families
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all user devices" ON public.user_devices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all refresh tokens" ON public.refresh_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.token_families TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_devices TO authenticated;
GRANT ALL ON public.refresh_tokens TO authenticated;

-- Grant service role permissions for admin operations
GRANT ALL ON public.token_families TO service_role;
GRANT ALL ON public.user_sessions TO service_role;
GRANT ALL ON public.user_devices TO service_role;
GRANT ALL ON public.refresh_tokens TO service_role;
