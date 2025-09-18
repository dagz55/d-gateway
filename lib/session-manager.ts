import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';
import { getClientIP } from './auth-middleware';
import { logSecurityEvent } from './session-security';

// Session versioning and management system
export interface UserSession {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  deviceId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location: GeoLocation;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface SessionInvalidationEvent {
  userId: string;
  reason: InvalidationReason;
  affectedSessions: string[];
  triggeredBy: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type InvalidationReason = 
  | 'password_change'
  | 'security_breach' 
  | 'suspicious_activity'
  | 'admin_action'
  | 'device_change'
  | 'location_change'
  | 'permission_change'
  | 'max_sessions_exceeded'
  | 'session_expired'
  | 'user_logout'
  | 'force_logout'
  | 'account_locked'
  | 'token_compromised';

export interface SessionConfig {
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
  deviceTrustDays: number;
  locationCheckEnabled: boolean;
  suspiciousActivityThreshold: number;
  adminSessionTimeoutMinutes: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 480, // 8 hours
  deviceTrustDays: 30,
  locationCheckEnabled: true,
  suspiciousActivityThreshold: 3,
  adminSessionTimeoutMinutes: 240, // 4 hours for admin sessions
};

export class SessionManager {
  private supabase: any;
  private config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate device fingerprint from request headers
   */
  generateDeviceFingerprint(userAgent: string, acceptLanguage: string, acceptEncoding: string): string {
    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    return createHash('sha256').update(fingerprint).digest('hex');
  }

  /**
   * Get approximate location from IP address
   */
  async getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
    try {
      // In production, you'd use a service like MaxMind, IPInfo, or similar
      // For now, we'll return a basic location structure
      return {
        country: 'US',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'America/Los_Angeles',
      };
    } catch (error) {
      console.warn('Failed to get location from IP:', error);
      return {};
    }
  }

  /**
   * Create a new session with versioning
   */
  async createSession(
    userId: string,
    request: any,
    permissions: string[] = ['user']
  ): Promise<UserSession> {
    const sessionId = this.generateSessionId();
    const userAgent = request.headers?.get?.('user-agent') || '';
    const acceptLanguage = request.headers?.get?.('accept-language') || '';
    const acceptEncoding = request.headers?.get?.('accept-encoding') || '';
    const ipAddress = getClientIP(request);
    
    const deviceFingerprint = this.generateDeviceFingerprint(
      userAgent,
      acceptLanguage,
      acceptEncoding
    );

    // Get device ID from existing sessions or generate new one
    const deviceId = await this.getOrCreateDeviceId(userId, deviceFingerprint);
    
    // Get location from IP
    const location = await this.getLocationFromIP(ipAddress);

    // Get next session version for user
    const sessionVersion = await this.getNextSessionVersion(userId);

    // Check concurrent session limits
    await this.enforceConcurrentSessionLimits(userId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (this.config.sessionTimeoutMinutes * 60 * 1000));

    const session: UserSession = {
      userId,
      sessionId,
      sessionVersion,
      deviceId,
      deviceFingerprint,
      ipAddress,
      userAgent: userAgent.substring(0, 500), // Limit length
      location,
      createdAt: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      permissions,
      metadata: {
        acceptLanguage,
        acceptEncoding,
      },
    };

    // Store session in database
    const { error } = await this.supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        session_version: sessionVersion,
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        ip_address: ipAddress,
        user_agent: userAgent.substring(0, 500),
        location_data: location,
        created_at: session.createdAt,
        last_activity: session.lastActivity,
        expires_at: session.expiresAt,
        is_active: true,
        permissions: permissions,
        metadata: session.metadata,
      });

    if (error) {
      console.error('Failed to store session:', error);
      throw new Error('Session creation failed');
    }

    // Log security event
    logSecurityEvent('session_created', {
      userId,
      sessionId,
      deviceId,
      ipAddress,
      userAgent: userAgent.substring(0, 100),
      sessionVersion,
    });

    return session;
  }

  /**
   * Get or create device ID for fingerprint
   */
  private async getOrCreateDeviceId(userId: string, deviceFingerprint: string): Promise<string> {
    // Check if device already exists for this user
    const { data: existingDevice } = await this.supabase
      .from('user_devices')
      .select('device_id')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceFingerprint)
      .eq('is_trusted', true)
      .single();

    if (existingDevice) {
      return existingDevice.device_id;
    }

    // Create new device
    const deviceId = randomBytes(16).toString('hex');
    
    await this.supabase
      .from('user_devices')
      .insert({
        user_id: userId,
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        is_trusted: false, // New devices start as untrusted
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });

    return deviceId;
  }

  /**
   * Get next session version for user
   */
  private async getNextSessionVersion(userId: string): Promise<number> {
    const { data: latestSession } = await this.supabase
      .from('user_sessions')
      .select('session_version')
      .eq('user_id', userId)
      .order('session_version', { ascending: false })
      .limit(1)
      .single();

    return (latestSession?.session_version || 0) + 1;
  }

  /**
   * Enforce concurrent session limits
   */
  private async enforceConcurrentSessionLimits(userId: string): Promise<void> {
    const { data: activeSessions } = await this.supabase
      .from('user_sessions')
      .select('session_id, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (activeSessions && activeSessions.length >= this.config.maxConcurrentSessions) {
      // Invalidate oldest sessions to make room
      const sessionsToInvalidate = activeSessions.slice(
        0,
        activeSessions.length - this.config.maxConcurrentSessions + 1
      );

      await this.invalidateSessions(
        userId,
        sessionsToInvalidate.map(s => s.session_id),
        'max_sessions_exceeded',
        'system'
      );
    }
  }

  /**
   * Validate session version
   */
  async validateSession(sessionId: string, requiredVersion?: number): Promise<{
    valid: boolean;
    session?: UserSession;
    reason?: string;
  }> {
    try {
      const { data: sessionData, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !sessionData) {
        return { valid: false, reason: 'Session not found' };
      }

      // Check expiration
      if (new Date(sessionData.expires_at) < new Date()) {
        await this.invalidateSession(sessionId, 'session_expired', 'system');
        return { valid: false, reason: 'Session expired' };
      }

      // Check version if provided
      if (requiredVersion !== undefined && sessionData.session_version < requiredVersion) {
        return { valid: false, reason: 'Session version outdated' };
      }

      const session: UserSession = {
        userId: sessionData.user_id,
        sessionId: sessionData.session_id,
        sessionVersion: sessionData.session_version,
        deviceId: sessionData.device_id,
        deviceFingerprint: sessionData.device_fingerprint,
        ipAddress: sessionData.ip_address,
        userAgent: sessionData.user_agent,
        location: sessionData.location_data || {},
        createdAt: sessionData.created_at,
        lastActivity: sessionData.last_activity,
        expiresAt: sessionData.expires_at,
        isActive: sessionData.is_active,
        permissions: sessionData.permissions || ['user'],
        metadata: sessionData.metadata || {},
      };

      return { valid: true, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, reason: 'Validation failed' };
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, request?: any): Promise<void> {
    const updates: any = {
      last_activity: new Date().toISOString(),
    };

    // Update IP if it changed (for mobile users)
    if (request) {
      const currentIP = getClientIP(request);
      updates.ip_address = currentIP;
    }

    await this.supabase
      .from('user_sessions')
      .update(updates)
      .eq('session_id', sessionId)
      .eq('is_active', true);
  }

  /**
   * Invalidate a single session
   */
  async invalidateSession(
    sessionId: string,
    reason: InvalidationReason,
    triggeredBy: string
  ): Promise<void> {
    const { data: session } = await this.supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .single();

    if (session) {
      await this.invalidateSessions(session.user_id, [sessionId], reason, triggeredBy);
    }
  }

  /**
   * Invalidate multiple sessions
   */
  async invalidateSessions(
    userId: string,
    sessionIds: string[],
    reason: InvalidationReason,
    triggeredBy: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (sessionIds.length === 0) return;

    // Mark sessions as inactive
    const { error } = await this.supabase
      .from('user_sessions')
      .update({
        is_active: false,
        invalidated_at: new Date().toISOString(),
        invalidation_reason: reason,
        invalidated_by: triggeredBy,
      })
      .in('session_id', sessionIds)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to invalidate sessions:', error);
      throw new Error('Session invalidation failed');
    }

    // Log invalidation event
    const invalidationEvent: SessionInvalidationEvent = {
      userId,
      reason,
      affectedSessions: sessionIds,
      triggeredBy,
      timestamp: new Date().toISOString(),
      metadata,
    };

    await this.supabase
      .from('session_invalidation_events')
      .insert({
        user_id: invalidationEvent.userId,
        reason: invalidationEvent.reason,
        affected_sessions: invalidationEvent.affectedSessions,
        triggered_by: invalidationEvent.triggeredBy,
        timestamp: invalidationEvent.timestamp,
        metadata: invalidationEvent.metadata,
      });

    // Log security event
    logSecurityEvent('sessions_invalidated', {
      userId,
      reason,
      sessionCount: sessionIds.length,
      triggeredBy,
      sessionIds: sessionIds.slice(0, 5), // Log first 5 session IDs
    });
  }

  /**
   * Invalidate all sessions for a user except current
   */
  async invalidateAllSessionsExcept(
    userId: string,
    excludeSessionId: string,
    reason: InvalidationReason,
    triggeredBy: string
  ): Promise<void> {
    const { data: sessions } = await this.supabase
      .from('user_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .neq('session_id', excludeSessionId);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.session_id);
      await this.invalidateSessions(userId, sessionIds, reason, triggeredBy);
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllSessions(
    userId: string,
    reason: InvalidationReason,
    triggeredBy: string
  ): Promise<void> {
    const { data: sessions } = await this.supabase
      .from('user_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.session_id);
      await this.invalidateSessions(userId, sessionIds, reason, triggeredBy);
    }
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    const { data: sessions, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }

    return sessions.map(s => ({
      userId: s.user_id,
      sessionId: s.session_id,
      sessionVersion: s.session_version,
      deviceId: s.device_id,
      deviceFingerprint: s.device_fingerprint,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      location: s.location_data || {},
      createdAt: s.created_at,
      lastActivity: s.last_activity,
      expiresAt: s.expires_at,
      isActive: s.is_active,
      permissions: s.permissions || ['user'],
      metadata: s.metadata || {},
    }));
  }

  /**
   * Check for suspicious activity
   */
  async checkSuspiciousActivity(userId: string, currentSession: UserSession): Promise<{
    suspicious: boolean;
    reasons: string[];
    recommendations: string[];
  }> {
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // Get recent sessions for comparison
    const recentSessions = await this.getUserSessions(userId);
    
    // Check for rapid location changes
    const locationChanges = this.detectRapidLocationChanges(recentSessions);
    if (locationChanges > this.config.suspiciousActivityThreshold) {
      reasons.push('Rapid location changes detected');
      recommendations.push('Consider invalidating sessions from untrusted locations');
    }

    // Check for multiple concurrent logins from different locations
    const concurrentLocations = this.detectConcurrentLocationLogins(recentSessions);
    if (concurrentLocations > 2) {
      reasons.push('Multiple concurrent logins from different locations');
      recommendations.push('Require device verification for new locations');
    }

    // Check for unusual user agent patterns
    const unusualDevices = this.detectUnusualDevices(recentSessions);
    if (unusualDevices > 1) {
      reasons.push('Logins from unusual devices detected');
      recommendations.push('Verify device ownership');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
      recommendations,
    };
  }

  private detectRapidLocationChanges(sessions: UserSession[]): number {
    // Simplified location change detection
    const locations = sessions
      .map(s => `${s.location.country}-${s.location.region}`)
      .filter(Boolean);
    
    return new Set(locations).size;
  }

  private detectConcurrentLocationLogins(sessions: UserSession[]): number {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentSessions = sessions.filter(s => 
      new Date(s.lastActivity) > oneHourAgo
    );
    
    const locations = recentSessions
      .map(s => `${s.location.country}-${s.location.region}`)
      .filter(Boolean);
    
    return new Set(locations).size;
  }

  private detectUnusualDevices(sessions: UserSession[]): number {
    const deviceTypes = sessions.map(s => {
      const ua = s.userAgent.toLowerCase();
      if (ua.includes('mobile')) return 'mobile';
      if (ua.includes('tablet')) return 'tablet';
      return 'desktop';
    });
    
    return new Set(deviceTypes).size;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const { data: expiredSessions } = await this.supabase
      .from('user_sessions')
      .select('session_id, user_id')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (!expiredSessions || expiredSessions.length === 0) {
      return 0;
    }

    // Group by user for efficient invalidation
    const userSessions = new Map<string, string[]>();
    expiredSessions.forEach(session => {
      const sessions = userSessions.get(session.user_id) || [];
      sessions.push(session.session_id);
      userSessions.set(session.user_id, sessions);
    });

    // Invalidate expired sessions
    for (const [userId, sessionIds] of userSessions) {
      await this.invalidateSessions(userId, sessionIds, 'session_expired', 'system');
    }

    return expiredSessions.length;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();