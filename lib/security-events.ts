/**
 * Security Event Definitions and Schemas
 * Comprehensive security event types and data structures for the Zignal authentication system
 */

export type SecurityEventType = 
  // Authentication Events
  | 'auth_login_success'
  | 'auth_login_failure' 
  | 'auth_logout'
  | 'auth_token_expired'
  | 'auth_token_refresh'
  | 'auth_token_revoked'
  | 'auth_session_created'
  | 'auth_session_expired'
  | 'auth_session_hijack_detected'
  | 'auth_password_change'
  | 'auth_account_locked'
  | 'auth_mfa_enabled'
  | 'auth_mfa_disabled'
  | 'auth_mfa_failure'
  
  // Authorization Events
  | 'authz_permission_granted'
  | 'authz_permission_denied'
  | 'authz_role_escalation'
  | 'authz_admin_access_attempt'
  | 'authz_resource_access_denied'
  | 'authz_invalid_scope'
  
  // Session Security Events
  | 'session_created'
  | 'session_destroyed'
  | 'session_timeout'
  | 'session_concurrent_login'
  | 'session_device_change'
  | 'session_location_change'
  | 'session_theft_detected'
  | 'session_fixation_attempt'
  
  // CSRF Events
  | 'csrf_token_invalid'
  | 'csrf_token_missing'
  | 'csrf_attack_detected'
  | 'csrf_origin_mismatch'
  | 'csrf_referer_mismatch'
  | 'csrf_validation_bypassed'
  
  // Rate Limiting Events
  | 'rate_limit_exceeded'
  | 'rate_limit_warning'
  | 'rate_limit_blocked'
  | 'rate_limit_pattern_detected'
  | 'rate_limit_bypass_attempt'
  
  // Admin Events
  | 'admin_login'
  | 'admin_privilege_escalation'
  | 'admin_config_change'
  | 'admin_user_management'
  | 'admin_security_override'
  | 'admin_data_access'
  | 'admin_system_modification'
  
  // Threat Detection Events
  | 'threat_brute_force_detected'
  | 'threat_credential_stuffing'
  | 'threat_account_enumeration'
  | 'threat_suspicious_automation'
  | 'threat_anomalous_behavior'
  | 'threat_geolocation_anomaly'
  | 'threat_device_fingerprint_change'
  | 'threat_velocity_attack'
  
  // System Security Events
  | 'security_policy_violation'
  | 'security_alert_triggered'
  | 'security_monitoring_disabled'
  | 'security_log_tampering'
  | 'security_backup_failure'
  | 'security_encryption_failure'
  
  // Network Security Events
  | 'network_suspicious_ip'
  | 'network_tor_access'
  | 'network_vpn_access'
  | 'network_geo_blocked'
  | 'network_proxy_detected'
  | 'network_bot_detected';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  isp?: string;
  asn?: string;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  cookiesEnabled?: boolean;
  doNotTrack?: boolean;
  fingerprint?: string;
}

export interface SecurityEventMetadata {
  // Request context
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  
  // Authentication context
  authMethod?: 'session' | 'token' | 'oauth';
  tokenType?: 'access' | 'refresh' | 'csrf';
  tokenFamily?: string;
  sessionDuration?: number;
  
  // Security context
  threatScore?: number;
  riskFactors?: string[];
  securityFlags?: string[];
  anomalyIndicators?: string[];
  
  // Attack context
  attackType?: string;
  attackVector?: string;
  payload?: string;
  exploitation?: boolean;
  
  // System context
  serverInstance?: string;
  region?: string;
  environment?: 'development' | 'staging' | 'production';
  
  // Additional metadata
  [key: string]: any;
}

export interface SecurityEvent {
  // Event identification
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  
  // User context
  userId?: string;
  email?: string;
  username?: string;
  sessionId?: string;
  
  // Network context
  ipAddress: string;
  userAgent: string;
  geolocation?: GeoLocation;
  deviceFingerprint?: DeviceFingerprint;
  
  // Event data
  message: string;
  details?: string;
  metadata: SecurityEventMetadata;
  
  // Threat assessment
  threatScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresAction: boolean;
  
  // Processing status
  processed: boolean;
  alertSent: boolean;
  acknowledged: boolean;
  
  // Correlation
  correlationId?: string;
  parentEventId?: string;
  relatedEvents?: string[];
  
  // Retention
  createdAt: string;
  expiresAt?: string;
}

export interface SecurityAlert {
  id: string;
  eventId: string;
  alertType: 'email' | 'slack' | 'webhook' | 'sms';
  title: string;
  description: string;
  severity: SecurityEventSeverity;
  recipients: string[];
  sentAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalated: boolean;
  escalatedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  metadata: Record<string, any>;
}

export interface SecurityMetrics {
  timeframe: string;
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  threatScoreDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topThreatSources: Array<{
    ipAddress: string;
    count: number;
    threatScore: number;
  }>;
  authenticationMetrics: {
    successfulLogins: number;
    failedLogins: number;
    successRate: number;
    averageSessionDuration: number;
  };
  rateLimitingMetrics: {
    totalBlocked: number;
    byEndpoint: Record<string, number>;
    byIpAddress: Record<string, number>;
  };
  csrfMetrics: {
    validations: number;
    failures: number;
    attacks: number;
  };
  anomalyDetection: {
    detected: number;
    falsePositives: number;
    accuracy: number;
  };
}

export interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  severity: SecurityEventSeverity;
  conditions: Array<{
    eventType: SecurityEventType;
    threshold: number;
    timeWindow: number;
    field?: string;
    operator?: 'eq' | 'gt' | 'lt' | 'contains' | 'regex';
    value?: any;
  }>;
  actions: Array<{
    type: 'alert' | 'block' | 'monitor' | 'escalate';
    config: Record<string, any>;
  }>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityEventFilter {
  eventTypes?: SecurityEventType[];
  severities?: SecurityEventSeverity[];
  userIds?: string[];
  ipAddresses?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  threatScoreMin?: number;
  threatScoreMax?: number;
  requiresAction?: boolean;
  processed?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'threatScore';
  sortOrder?: 'asc' | 'desc';
}

export interface SecurityDashboardConfig {
  refreshInterval: number;
  alertThresholds: {
    criticalEvents: number;
    highThreatScore: number;
    failedLoginsPerHour: number;
    rateLimitViolationsPerHour: number;
  };
  widgets: Array<{
    type: 'events' | 'metrics' | 'alerts' | 'charts';
    config: Record<string, any>;
    position: { x: number; y: number; w: number; h: number };
  }>;
  notifications: {
    email: boolean;
    slack: boolean;
    realtime: boolean;
  };
}

// Event severity mapping
export const SECURITY_EVENT_SEVERITY: Record<SecurityEventType, SecurityEventSeverity> = {
  // Critical Events
  'auth_session_hijack_detected': 'critical',
  'session_theft_detected': 'critical',
  'threat_brute_force_detected': 'critical',
  'admin_privilege_escalation': 'critical',
  'security_log_tampering': 'critical',
  'csrf_attack_detected': 'critical',
  
  // High Events
  'auth_login_failure': 'high',
  'authz_permission_denied': 'high',
  'threat_credential_stuffing': 'high',
  'threat_account_enumeration': 'high',
  'admin_security_override': 'high',
  'rate_limit_pattern_detected': 'high',
  'session_fixation_attempt': 'high',
  
  // Medium Events
  'auth_token_expired': 'medium',
  'session_device_change': 'medium',
  'session_location_change': 'medium',
  'csrf_token_invalid': 'medium',
  'rate_limit_exceeded': 'medium',
  'threat_anomalous_behavior': 'medium',
  'network_suspicious_ip': 'medium',
  
  // Low Events (default for others)
  'auth_login_success': 'low',
  'auth_logout': 'low',
  'session_created': 'low',
  'auth_token_refresh': 'low',
  'authz_permission_granted': 'low',
  
  // Add remaining events with appropriate severities
  'auth_token_revoked': 'medium',
  'auth_session_created': 'low',
  'auth_session_expired': 'medium',
  'auth_password_change': 'medium',
  'auth_account_locked': 'high',
  'auth_mfa_enabled': 'low',
  'auth_mfa_disabled': 'medium',
  'auth_mfa_failure': 'high',
  'authz_role_escalation': 'high',
  'authz_admin_access_attempt': 'high',
  'authz_resource_access_denied': 'medium',
  'authz_invalid_scope': 'medium',
  'session_destroyed': 'low',
  'session_timeout': 'low',
  'session_concurrent_login': 'medium',
  'csrf_token_missing': 'medium',
  'csrf_origin_mismatch': 'medium',
  'csrf_referer_mismatch': 'medium',
  'csrf_validation_bypassed': 'high',
  'rate_limit_warning': 'low',
  'rate_limit_blocked': 'medium',
  'rate_limit_bypass_attempt': 'high',
  'admin_login': 'medium',
  'admin_config_change': 'high',
  'admin_user_management': 'medium',
  'admin_data_access': 'medium',
  'admin_system_modification': 'high',
  'threat_suspicious_automation': 'medium',
  'threat_geolocation_anomaly': 'medium',
  'threat_device_fingerprint_change': 'medium',
  'threat_velocity_attack': 'high',
  'security_policy_violation': 'medium',
  'security_alert_triggered': 'high',
  'security_monitoring_disabled': 'critical',
  'security_backup_failure': 'high',
  'security_encryption_failure': 'critical',
  'network_tor_access': 'medium',
  'network_vpn_access': 'low',
  'network_geo_blocked': 'medium',
  'network_proxy_detected': 'medium',
  'network_bot_detected': 'medium',
};

// Risk factor mappings
export const RISK_FACTORS = {
  HIGH_RISK_COUNTRIES: ['CN', 'RU', 'IR', 'KP', 'SY'],
  SUSPICIOUS_USER_AGENTS: [
    /curl/i, /wget/i, /python/i, /requests/i, /bot/i, 
    /crawler/i, /spider/i, /scraper/i, /automated/i
  ],
  TOR_EXIT_NODES: [], // This would be populated from a real-time TOR exit node list
  KNOWN_PROXY_RANGES: [], // This would be populated from proxy detection services
  VPN_RANGES: [], // This would be populated from VPN detection services
};

// Threat score calculation weights
export const THREAT_SCORE_WEIGHTS = {
  FAILED_LOGIN: 10,
  BRUTE_FORCE: 50,
  CREDENTIAL_STUFFING: 40,
  SUSPICIOUS_LOCATION: 20,
  TOR_USAGE: 30,
  PROXY_USAGE: 15,
  BOT_DETECTION: 25,
  RATE_LIMITING: 15,
  CSRF_VIOLATION: 20,
  SESSION_ANOMALY: 30,
  ADMIN_ACCESS: 40,
  PRIVILEGE_ESCALATION: 60,
  MULTIPLE_FAILURES: 35,
  DEVICE_CHANGE: 10,
  TIME_ANOMALY: 15,
};