-- Migration: Token Rotation System
-- Description: Creates tables and indexes for JWT token rotation with refresh token flow
-- Version: 1.0.0
-- Created: 2025-09-17

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create token_families table for tracking token family lineage
CREATE TABLE IF NOT EXISTS token_families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    token_chain TEXT[] NOT NULL DEFAULT '{}',
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ NULL,
    revoked_reason TEXT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create refresh_tokens table for secure refresh token storage
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of the token
    family_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    access_token_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    invalidated BOOLEAN NOT NULL DEFAULT FALSE,
    invalidated_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create token_security_events table for audit logging
CREATE TABLE IF NOT EXISTS token_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255) NULL,
    session_id VARCHAR(255) NULL,
    family_id VARCHAR(255) NULL,
    token_id VARCHAR(255) NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    details JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance optimization

-- Token families indexes
CREATE INDEX IF NOT EXISTS idx_token_families_family_id ON token_families(family_id);
CREATE INDEX IF NOT EXISTS idx_token_families_user_id ON token_families(user_id);
CREATE INDEX IF NOT EXISTS idx_token_families_session_id ON token_families(session_id);
CREATE INDEX IF NOT EXISTS idx_token_families_expires_at ON token_families(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_families_revoked ON token_families(revoked) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_token_families_last_used ON token_families(last_used);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id ON refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_invalidated ON refresh_tokens(invalidated) WHERE invalidated = false;

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_token_security_events_event_type ON token_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_token_security_events_user_id ON token_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_token_security_events_created_at ON token_security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_token_security_events_ip_address ON token_security_events(ip_address);

-- Add foreign key constraints
ALTER TABLE refresh_tokens
ADD CONSTRAINT fk_refresh_tokens_family_id
FOREIGN KEY (family_id) REFERENCES token_families(family_id)
ON DELETE CASCADE;

-- Create functions for automatic cleanup

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_token_families_updated_at
    BEFORE UPDATE ON token_families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refresh_tokens_updated_at
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for automatic token cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_families INTEGER;
    deleted_tokens INTEGER;
BEGIN
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_tokens = ROW_COUNT;
    
    -- Delete expired token families
    DELETE FROM token_families
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_families = ROW_COUNT;
    
    -- Log cleanup event
    INSERT INTO token_security_events (event_type, details, created_at)
    VALUES (
        'token_cleanup_completed',
        jsonb_build_object(
            'deleted_families', deleted_families,
            'deleted_tokens', deleted_tokens,
            'cleanup_time', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_families + deleted_tokens;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke token family
CREATE OR REPLACE FUNCTION revoke_token_family(
    p_family_id VARCHAR(255),
    p_reason TEXT DEFAULT 'Manual revocation'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update token family
    UPDATE token_families
    SET 
        revoked = TRUE,
        revoked_at = NOW(),
        revoked_reason = p_reason,
        updated_at = NOW()
    WHERE family_id = p_family_id;
    
    -- Invalidate all refresh tokens in the family
    UPDATE refresh_tokens
    SET 
        invalidated = TRUE,
        invalidated_at = NOW(),
        updated_at = NOW()
    WHERE family_id = p_family_id;
    
    -- Log revocation event
    INSERT INTO token_security_events (event_type, family_id, details, created_at)
    VALUES (
        'token_family_revoked',
        p_family_id,
        jsonb_build_object(
            'reason', p_reason,
            'revoked_at', NOW()
        ),
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get token statistics
CREATE OR REPLACE FUNCTION get_token_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_families', (SELECT COUNT(*) FROM token_families),
        'active_families', (SELECT COUNT(*) FROM token_families WHERE revoked = false AND expires_at > NOW()),
        'revoked_families', (SELECT COUNT(*) FROM token_families WHERE revoked = true),
        'total_tokens', (SELECT COUNT(*) FROM refresh_tokens),
        'active_tokens', (SELECT COUNT(*) FROM refresh_tokens WHERE invalidated = false AND expires_at > NOW()),
        'invalidated_tokens', (SELECT COUNT(*) FROM refresh_tokens WHERE invalidated = true),
        'expired_families', (SELECT COUNT(*) FROM token_families WHERE expires_at <= NOW()),
        'expired_tokens', (SELECT COUNT(*) FROM refresh_tokens WHERE expires_at <= NOW()),
        'last_cleanup', (
            SELECT created_at 
            FROM token_security_events 
            WHERE event_type = 'token_cleanup_completed' 
            ORDER BY created_at DESC 
            LIMIT 1
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create RLS (Row Level Security) policies for enhanced security

-- Enable RLS on all tables
ALTER TABLE token_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_security_events ENABLE ROW LEVEL SECURITY;

-- Token families policies
CREATE POLICY "Users can only access their own token families"
ON token_families FOR ALL
USING (auth.uid()::text = user_id);

-- Refresh tokens policies
CREATE POLICY "Users can only access their own refresh tokens"
ON refresh_tokens FOR ALL
USING (auth.uid()::text = user_id);

-- Security events policies (read-only for users, admin access needed for full access)
CREATE POLICY "Users can only view their own security events"
ON token_security_events FOR SELECT
USING (auth.uid()::text = user_id);

-- Admin policies (assuming admin role exists)
CREATE POLICY "Admins can access all token families"
ON token_families FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid()::text 
        AND user_profiles.is_admin = true
    )
);

CREATE POLICY "Admins can access all refresh tokens"
ON refresh_tokens FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid()::text 
        AND user_profiles.is_admin = true
    )
);

CREATE POLICY "Admins can access all security events"
ON token_security_events FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid()::text 
        AND user_profiles.is_admin = true
    )
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON token_families TO authenticated;
GRANT SELECT, INSERT, UPDATE ON refresh_tokens TO authenticated;
GRANT SELECT, INSERT ON token_security_events TO authenticated;

-- Grant permissions to service role (for server-side operations)
GRANT ALL ON token_families TO service_role;
GRANT ALL ON refresh_tokens TO service_role;
GRANT ALL ON token_security_events TO service_role;

-- Create a scheduled cleanup job (this would typically be done via pg_cron if available)
-- For now, we'll create a function that can be called manually or via API

-- Function to schedule automatic cleanup (if pg_cron is available)
DO $$
BEGIN
    -- Try to create a cron job for cleanup if pg_cron extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Run cleanup every hour
        PERFORM cron.schedule('token-cleanup', '0 * * * *', 'SELECT cleanup_expired_tokens();');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- pg_cron not available, continue without scheduling
        NULL;
END $$;

-- Insert initial security event to mark migration completion
INSERT INTO token_security_events (event_type, details, created_at)
VALUES (
    'token_system_initialized',
    jsonb_build_object(
        'migration_version', '20250917000001',
        'initialized_at', NOW(),
        'features', ARRAY[
            'token_families',
            'refresh_tokens', 
            'security_events',
            'automatic_cleanup',
            'row_level_security'
        ]
    ),
    NOW()
);

-- Add helpful comments
COMMENT ON TABLE token_families IS 'Tracks JWT token family lineage for security and rotation';
COMMENT ON TABLE refresh_tokens IS 'Stores hashed refresh tokens for secure token rotation';
COMMENT ON TABLE token_security_events IS 'Audit log for token-related security events';

COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Automatically cleans up expired tokens and families';
COMMENT ON FUNCTION revoke_token_family(VARCHAR, TEXT) IS 'Revokes an entire token family for security';
COMMENT ON FUNCTION get_token_statistics() IS 'Returns comprehensive token system statistics';