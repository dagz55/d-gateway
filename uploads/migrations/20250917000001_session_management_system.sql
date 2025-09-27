-- Session Management System Migration
-- This migration creates tables for comprehensive session invalidation and device management

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  session_version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  permissions TEXT[] DEFAULT ARRAY['user'],
  metadata JSONB DEFAULT '{}',
  invalidated_at TIMESTAMP WITH TIME ZONE,
  invalidation_reason TEXT,
  invalidated_by TEXT,
  CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User Devices Table
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'smart_tv', 'game_console', 'unknown')),
  operating_system TEXT,
  browser TEXT,
  is_trusted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_ip INET,
  location_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  trusted_at TIMESTAMP WITH TIME ZONE,
  trusted_by TEXT,
  trust_expires_at TIMESTAMP WITH TIME ZONE,
  trust_revoked_at TIMESTAMP WITH TIME ZONE,
  trust_revoked_by TEXT,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivation_reason TEXT,
  archived BOOLEAN DEFAULT false,
  CONSTRAINT fk_user_devices_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_devices_user_device UNIQUE (user_id, device_id)
);

-- Session Invalidation Events Table
CREATE TABLE IF NOT EXISTS session_invalidation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  affected_sessions TEXT[] NOT NULL,
  triggered_by TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  CONSTRAINT fk_session_invalidation_events_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Device Verification Requests Table
CREATE TABLE IF NOT EXISTS device_verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('email', 'sms', 'authenticator')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  CONSTRAINT fk_device_verification_requests_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Graceful Invalidation Schedule Table
CREATE TABLE IF NOT EXISTS graceful_invalidation_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_ids TEXT[] NOT NULL,
  trigger TEXT NOT NULL,
  triggered_by TEXT NOT NULL,
  warning_time_minutes INTEGER NOT NULL DEFAULT 5,
  message TEXT NOT NULL,
  redirect_url TEXT,
  allow_extension BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  execute_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'executed', 'cancelled', 'failed')),
  executed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by TEXT,
  delayed_at TIMESTAMP WITH TIME ZONE,
  delayed_by TEXT,
  delay_reason TEXT,
  error_message TEXT,
  execution_note TEXT,
  CONSTRAINT fk_graceful_invalidation_schedule_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User Notifications Table (for session invalidation notifications)
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user_notifications_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Security Events Log Table (enhanced version)
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  device_id TEXT,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical', 'info')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  INDEX idx_security_events_user_id ON security_events(user_id),
  INDEX idx_security_events_timestamp ON security_events(timestamp),
  INDEX idx_security_events_type ON security_events(event_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_id ON user_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_trusted ON user_devices(is_trusted);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_active ON user_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_session_invalidation_events_user_id ON session_invalidation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_invalidation_events_timestamp ON session_invalidation_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_device_verification_requests_user_id ON device_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_device_verification_requests_device_id ON device_verification_requests(device_id);
CREATE INDEX IF NOT EXISTS idx_device_verification_requests_expires_at ON device_verification_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_graceful_invalidation_schedule_user_id ON graceful_invalidation_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_graceful_invalidation_schedule_execute_at ON graceful_invalidation_schedule(execute_at);
CREATE INDEX IF NOT EXISTS idx_graceful_invalidation_schedule_status ON graceful_invalidation_schedule(status);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);

-- Row Level Security Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_invalidation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE graceful_invalidation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- User Sessions RLS Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage all sessions" ON user_sessions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User Devices RLS Policies
CREATE POLICY "Users can view their own devices" ON user_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own devices" ON user_devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage all devices" ON user_devices FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Session Invalidation Events RLS Policies
CREATE POLICY "Users can view their own invalidation events" ON session_invalidation_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage all invalidation events" ON session_invalidation_events FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Device Verification Requests RLS Policies
CREATE POLICY "Users can view their own verification requests" ON device_verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own verification requests" ON device_verification_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage all verification requests" ON device_verification_requests FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Graceful Invalidation Schedule RLS Policies
CREATE POLICY "Users can view their own invalidation schedules" ON graceful_invalidation_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own invalidation schedules" ON graceful_invalidation_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage all invalidation schedules" ON graceful_invalidation_schedule FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage all notifications" ON user_notifications FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Security Events RLS Policies
CREATE POLICY "Users can view their own security events" ON security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage all security events" ON security_events FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions for session management

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE user_sessions 
  SET 
    is_active = false,
    invalidated_at = NOW(),
    invalidation_reason = 'session_expired',
    invalidated_by = 'system'
  WHERE 
    is_active = true 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Clean up old verification requests
  DELETE FROM device_verification_requests 
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  -- Clean up old completed invalidation schedules
  DELETE FROM graceful_invalidation_schedule 
  WHERE 
    status IN ('executed', 'cancelled', 'failed') 
    AND scheduled_at < NOW() - INTERVAL '30 days';
  
  -- Archive old notifications
  UPDATE user_notifications 
  SET expires_at = NOW() 
  WHERE 
    created_at < NOW() - INTERVAL '90 days' 
    AND expires_at IS NULL;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(session_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions 
  SET 
    last_activity = NOW()
  WHERE 
    session_id = session_id_param 
    AND is_active = true 
    AND expires_at > NOW();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user session statistics
CREATE OR REPLACE FUNCTION get_user_session_stats(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_sessions', (
      SELECT COUNT(*) FROM user_sessions 
      WHERE user_id = user_id_param AND is_active = true
    ),
    'total_devices', (
      SELECT COUNT(*) FROM user_devices 
      WHERE user_id = user_id_param AND is_active = true
    ),
    'trusted_devices', (
      SELECT COUNT(*) FROM user_devices 
      WHERE user_id = user_id_param AND is_trusted = true AND is_active = true
    ),
    'pending_invalidations', (
      SELECT COUNT(*) FROM graceful_invalidation_schedule 
      WHERE user_id = user_id_param AND status = 'scheduled'
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM user_notifications 
      WHERE user_id = user_id_param AND read = false AND (expires_at IS NULL OR expires_at > NOW())
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic cleanup and maintenance

-- Trigger to update device last_seen when session is active
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_activity IS DISTINCT FROM OLD.last_activity THEN
    UPDATE user_devices 
    SET 
      last_seen = NEW.last_activity,
      last_ip = NEW.ip_address
    WHERE 
      device_id = NEW.device_id 
      AND user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_last_seen
  AFTER UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

-- Trigger to log security events for session changes
CREATE OR REPLACE FUNCTION log_session_security_events()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO security_events (event_type, user_id, session_id, device_id, ip_address, event_data)
    VALUES (
      'session_created',
      NEW.user_id,
      NEW.session_id,
      NEW.device_id,
      NEW.ip_address,
      json_build_object(
        'session_version', NEW.session_version,
        'user_agent', NEW.user_agent,
        'location', NEW.location_data
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN
    INSERT INTO security_events (event_type, user_id, session_id, device_id, event_data)
    VALUES (
      'session_invalidated',
      NEW.user_id,
      NEW.session_id,
      NEW.device_id,
      json_build_object(
        'reason', NEW.invalidation_reason,
        'invalidated_by', NEW.invalidated_by,
        'invalidated_at', NEW.invalidated_at
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_session_security_events
  AFTER INSERT OR UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_security_events();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_invalidation_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON device_verification_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON graceful_invalidation_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_events TO authenticated;

GRANT ALL ON user_sessions TO service_role;
GRANT ALL ON user_devices TO service_role;
GRANT ALL ON session_invalidation_events TO service_role;
GRANT ALL ON device_verification_requests TO service_role;
GRANT ALL ON graceful_invalidation_schedule TO service_role;
GRANT ALL ON user_notifications TO service_role;
GRANT ALL ON security_events TO service_role;

-- Grant usage on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION update_session_activity(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_session_stats(UUID) TO authenticated, service_role;

-- Add comments for documentation
COMMENT ON TABLE user_sessions IS 'Stores user session information with versioning and device tracking';
COMMENT ON TABLE user_devices IS 'Stores user device information and trust status';
COMMENT ON TABLE session_invalidation_events IS 'Logs all session invalidation events for audit trails';
COMMENT ON TABLE device_verification_requests IS 'Stores device verification requests and status';
COMMENT ON TABLE graceful_invalidation_schedule IS 'Schedules graceful session invalidations with warnings';
COMMENT ON TABLE user_notifications IS 'Stores user notifications for session and security events';
COMMENT ON TABLE security_events IS 'Comprehensive security event logging for session management';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Cleans up expired sessions and old data';
COMMENT ON FUNCTION update_session_activity(TEXT) IS 'Updates last activity timestamp for a session';
COMMENT ON FUNCTION get_user_session_stats(UUID) IS 'Returns session and device statistics for a user';