-- Security Events and Monitoring Tables
-- Migration to create comprehensive security logging infrastructure

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    geolocation JSONB,
    device_fingerprint JSONB,
    message TEXT NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    threat_score INTEGER DEFAULT 0 CHECK (threat_score >= 0 AND threat_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    requires_action BOOLEAN DEFAULT FALSE,
    processed BOOLEAN DEFAULT FALSE,
    alert_sent BOOLEAN DEFAULT FALSE,
    acknowledged BOOLEAN DEFAULT FALSE,
    correlation_id UUID,
    parent_event_id UUID REFERENCES security_events(id) ON DELETE SET NULL,
    related_events UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('email', 'slack', 'webhook', 'sms')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    recipients TEXT[] NOT NULL,
    sent_at TIMESTAMPTZ,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ,
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMPTZ,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create threat_patterns table
CREATE TABLE IF NOT EXISTS threat_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_metrics table for aggregated data
CREATE TABLE IF NOT EXISTS security_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_data JSONB DEFAULT '{}',
    time_window TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create user_behavior_profiles table for behavioral analysis
CREATE TABLE IF NOT EXISTS user_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    login_patterns JSONB DEFAULT '{}',
    device_patterns JSONB DEFAULT '{}',
    location_patterns JSONB DEFAULT '{}',
    risk_factors TEXT[],
    anomaly_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create suspicious_ips table for IP tracking
CREATE TABLE IF NOT EXISTS suspicious_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL UNIQUE,
    threat_score INTEGER DEFAULT 0 CHECK (threat_score >= 0 AND threat_score <= 100),
    blocked BOOLEAN DEFAULT FALSE,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    event_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_tracking table for session security
CREATE TABLE IF NOT EXISTS session_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint JSONB,
    geolocation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    end_reason TEXT,
    is_suspicious BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_score ON security_events(threat_score);
CREATE INDEX IF NOT EXISTS idx_security_events_requires_action ON security_events(requires_action);
CREATE INDEX IF NOT EXISTS idx_security_events_processed ON security_events(processed);
CREATE INDEX IF NOT EXISTS idx_security_events_correlation_id ON security_events(correlation_id);

CREATE INDEX IF NOT EXISTS idx_security_alerts_event_id ON security_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON security_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_security_metrics_type_name ON security_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_security_metrics_recorded_at ON security_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_security_metrics_expires_at ON security_metrics(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_behavior_profiles_user_id ON user_behavior_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_profiles_anomaly_score ON user_behavior_profiles(anomaly_score);

CREATE INDEX IF NOT EXISTS idx_suspicious_ips_ip_address ON suspicious_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_threat_score ON suspicious_ips(threat_score);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_blocked ON suspicious_ips(blocked);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_last_seen ON suspicious_ips(last_seen);

CREATE INDEX IF NOT EXISTS idx_session_tracking_session_id ON session_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_user_id ON session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_ip_address ON session_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_session_tracking_created_at ON session_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_session_tracking_is_suspicious ON session_tracking(is_suspicious);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_events_user_severity_date ON security_events(user_id, severity, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_type_date ON security_events(ip_address, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type_severity_date ON security_events(event_type, severity, created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_events_updated_at 
    BEFORE UPDATE ON security_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at 
    BEFORE UPDATE ON security_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_patterns_updated_at 
    BEFORE UPDATE ON threat_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_behavior_profiles_updated_at 
    BEFORE UPDATE ON user_behavior_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suspicious_ips_updated_at 
    BEFORE UPDATE ON suspicious_ips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically expire old events
CREATE OR REPLACE FUNCTION cleanup_expired_security_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM security_metrics 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate threat scores
CREATE OR REPLACE FUNCTION calculate_threat_score(
    event_type_param TEXT,
    severity_param TEXT,
    user_id_param UUID DEFAULT NULL,
    ip_address_param TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 0;
    user_history_multiplier NUMERIC := 1.0;
    ip_history_multiplier NUMERIC := 1.0;
    final_score INTEGER;
BEGIN
    -- Base score by event type
    CASE event_type_param
        WHEN 'auth_login_failure' THEN base_score := 10;
        WHEN 'threat_brute_force_detected' THEN base_score := 50;
        WHEN 'csrf_attack_detected' THEN base_score := 40;
        WHEN 'admin_privilege_escalation' THEN base_score := 60;
        WHEN 'rate_limit_exceeded' THEN base_score := 15;
        ELSE base_score := 5;
    END CASE;
    
    -- Severity multiplier
    CASE severity_param
        WHEN 'critical' THEN base_score := base_score * 3;
        WHEN 'high' THEN base_score := base_score * 2;
        WHEN 'medium' THEN base_score := base_score * 1.5;
        ELSE base_score := base_score * 1;
    END CASE;
    
    -- User history factor
    IF user_id_param IS NOT NULL THEN
        SELECT COUNT(*) INTO user_history_multiplier
        FROM security_events 
        WHERE user_id = user_id_param 
        AND created_at > NOW() - INTERVAL '24 hours'
        AND severity IN ('high', 'critical');
        
        user_history_multiplier := 1.0 + (user_history_multiplier * 0.2);
    END IF;
    
    -- IP history factor
    IF ip_address_param IS NOT NULL THEN
        SELECT COUNT(*) INTO ip_history_multiplier
        FROM security_events 
        WHERE ip_address = ip_address_param 
        AND created_at > NOW() - INTERVAL '1 hour';
        
        ip_history_multiplier := 1.0 + (ip_history_multiplier * 0.1);
    END IF;
    
    final_score := LEAST(100, GREATEST(0, 
        ROUND(base_score * user_history_multiplier * ip_history_multiplier)::INTEGER
    ));
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for security tables
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin can access all security events" ON security_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all security alerts" ON security_alerts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all threat patterns" ON threat_patterns
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all security metrics" ON security_metrics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all behavior profiles" ON user_behavior_profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all suspicious IPs" ON suspicious_ips
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can access all session tracking" ON session_tracking
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User access policies (users can only see their own events)
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own behavior profile" ON user_behavior_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own session tracking" ON session_tracking
    FOR SELECT USING (user_id = auth.uid());

-- Service role bypass (for the security logger)
CREATE POLICY "Service role can insert security events" ON security_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update security events" ON security_events
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert security alerts" ON security_alerts
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Insert default threat patterns
INSERT INTO threat_patterns (name, description, severity, conditions, actions) VALUES
(
    'rapid_login_failures',
    'Multiple rapid login failures from same IP',
    'high',
    '[{"eventType": "auth_login_failure", "threshold": 5, "timeWindow": 300000}]'::jsonb,
    '[{"type": "alert", "config": {"severity": "high"}}, {"type": "block", "config": {"duration": 3600000}}]'::jsonb
),
(
    'brute_force_attack',
    'Brute force attack pattern detected',
    'critical',
    '[{"eventType": "auth_login_failure", "threshold": 10, "timeWindow": 600000}]'::jsonb,
    '[{"type": "alert", "config": {"severity": "critical"}}, {"type": "block", "config": {"duration": 7200000}}]'::jsonb
),
(
    'csrf_attack_pattern',
    'Multiple CSRF validation failures',
    'high',
    '[{"eventType": "csrf_token_invalid", "threshold": 5, "timeWindow": 300000}]'::jsonb,
    '[{"type": "alert", "config": {"severity": "high"}}, {"type": "monitor", "config": {"duration": 1800000}}]'::jsonb
),
(
    'admin_access_anomaly',
    'Unusual admin access pattern',
    'high',
    '[{"eventType": "admin_login", "threshold": 3, "timeWindow": 3600000, "field": "ip_address", "operator": "distinct"}]'::jsonb,
    '[{"type": "alert", "config": {"severity": "high"}}, {"type": "escalate", "config": {"level": "security_team"}}]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Create view for security dashboard
CREATE OR REPLACE VIEW security_dashboard_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    event_type,
    severity,
    COUNT(*) as event_count,
    AVG(threat_score) as avg_threat_score,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips
FROM security_events 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), event_type, severity
ORDER BY hour DESC;

-- Grant permissions
GRANT ALL ON security_events TO service_role;
GRANT ALL ON security_alerts TO service_role;
GRANT ALL ON threat_patterns TO service_role;
GRANT ALL ON security_metrics TO service_role;
GRANT ALL ON user_behavior_profiles TO service_role;
GRANT ALL ON suspicious_ips TO service_role;
GRANT ALL ON session_tracking TO service_role;
GRANT SELECT ON security_dashboard_summary TO service_role;