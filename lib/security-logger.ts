/**
 * Core Security Logging System
 * Comprehensive security event logging with real-time processing and persistence
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  SecurityEvent, 
  SecurityEventType, 
  SecurityEventSeverity, 
  SecurityEventMetadata,
  SecurityAlert,
  GeoLocation,
  DeviceFingerprint,
  SECURITY_EVENT_SEVERITY,
  THREAT_SCORE_WEIGHTS
} from './security-events';
import { extractClientIP, anonymizeIP } from './ip-utils';

// Generate UUID using crypto.randomUUID (built into Node.js)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Environment configuration
const SECURITY_CONFIG = {
  enabled: process.env.SECURITY_LOGGING_ENABLED === 'true', // Default to false to prevent errors
  logLevel: process.env.SECURITY_LOG_LEVEL || 'info',
  realTimeProcessing: process.env.SECURITY_REALTIME_PROCESSING !== 'false',
  alerting: process.env.SECURITY_ALERTING_ENABLED !== 'false',
  retention: {
    low: 30, // days
    medium: 90,
    high: 365,
    critical: 2555, // 7 years for compliance
  },
  batching: {
    enabled: process.env.SECURITY_BATCH_LOGGING === 'true',
    size: parseInt(process.env.SECURITY_BATCH_SIZE || '100'),
    interval: parseInt(process.env.SECURITY_BATCH_INTERVAL || '5000'), // ms
  },
  performance: {
    maxProcessingTime: 100, // ms
    asyncLogging: true,
    bufferSize: 1000,
  },
};

// Supabase client for security logging
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration missing for security logging');
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabaseClient;
}

// In-memory buffer for batch processing
let eventBuffer: SecurityEvent[] = [];
let processingBuffer = false;

/**
 * Core Security Logger Class
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private correlationMap = new Map<string, string[]>();
  private performanceMetrics = {
    eventsLogged: 0,
    averageProcessingTime: 0,
    totalProcessingTime: 0,
    errors: 0,
  };

  private constructor() {
    // Start batch processing if enabled
    if (SECURITY_CONFIG.batching.enabled) {
      this.startBatchProcessing();
    }
  }

  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Log a security event with comprehensive data collection
   */
  public async logEvent(
    eventType: SecurityEventType,
    context: {
      request?: NextRequest;
      userId?: string;
      sessionId?: string;
      message?: string;
      details?: string;
      metadata?: SecurityEventMetadata;
      customSeverity?: SecurityEventSeverity;
      correlationId?: string;
      parentEventId?: string;
    }
  ): Promise<SecurityEvent | null> {
    if (!SECURITY_CONFIG.enabled) {
      return null;
    }

    const startTime = Date.now();

    try {
      // Create comprehensive security event
      const event = await this.createSecurityEvent(eventType, context);
      
      // Process the event
      await this.processEvent(event);
      
      // Update performance metrics
      this.updatePerformanceMetrics(Date.now() - startTime);
      
      return event;
    } catch (error) {
      console.error('Security logging error:', error);
      this.performanceMetrics.errors++;
      return null;
    }
  }

  /**
   * Create a comprehensive security event
   */
  private async createSecurityEvent(
    eventType: SecurityEventType,
    context: any
  ): Promise<SecurityEvent> {
    const timestamp = new Date().toISOString();
    const eventId = generateUUID();
    
    // Extract network information
    const ipInfo = context.request ? extractClientIP(context.request) : { ip: 'unknown', source: 'unknown' };
    const userAgent = context.request?.headers.get('user-agent') || 'unknown';
    
    // Get geolocation (in production, use a proper geolocation service)
    const geolocation = await this.getGeolocation(ipInfo.ip);
    
    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(context.request);
    
    // Calculate threat score
    const threatScore = this.calculateThreatScore(eventType, context, geolocation, deviceFingerprint);
    
    // Determine severity
    const severity = context.customSeverity || SECURITY_EVENT_SEVERITY[eventType] || 'medium';
    
    // Create the event
    const event: SecurityEvent = {
      id: eventId,
      timestamp,
      eventType,
      severity,
      userId: context.userId,
      email: context.metadata?.email,
      username: context.metadata?.username,
      sessionId: context.sessionId,
      ipAddress: anonymizeIP(ipInfo.ip),
      userAgent: userAgent.substring(0, 500), // Limit length
      geolocation,
      deviceFingerprint,
      message: context.message || this.getDefaultMessage(eventType),
      details: context.details,
      metadata: {
        ...context.metadata,
        ipSource: ipInfo.source,
        requestId: context.request ? this.getRequestId(context.request) : undefined,
        endpoint: context.request?.nextUrl.pathname,
        method: context.request?.method,
        timestamp: timestamp,
        environment: process.env.NODE_ENV || 'unknown',
        serverInstance: process.env.SERVER_INSTANCE || 'unknown',
      },
      threatScore,
      riskLevel: this.calculateRiskLevel(threatScore, severity),
      requiresAction: this.requiresAction(eventType, threatScore, severity),
      processed: false,
      alertSent: false,
      acknowledged: false,
      correlationId: context.correlationId,
      parentEventId: context.parentEventId,
      relatedEvents: [],
      createdAt: timestamp,
      expiresAt: this.calculateExpiryDate(severity),
    };

    // Add correlation tracking
    if (context.correlationId) {
      this.addToCorrelation(context.correlationId, eventId);
      event.relatedEvents = this.correlationMap.get(context.correlationId) || [];
    }

    return event;
  }

  /**
   * Process a security event (persistence, alerting, real-time analysis)
   */
  private async processEvent(event: SecurityEvent): Promise<void> {
    try {
      // Immediate threat detection
      if (event.requiresAction) {
        await this.handleImmediateThreat(event);
      }

      // Store the event
      if (SECURITY_CONFIG.batching.enabled) {
        this.addToBuffer(event);
      } else {
        await this.persistEvent(event);
      }

      // Real-time processing
      if (SECURITY_CONFIG.realTimeProcessing) {
        await this.realTimeProcessing(event);
      }

      // Generate alerts if needed
      if (SECURITY_CONFIG.alerting && this.shouldAlert(event)) {
        await this.generateAlert(event);
      }

      // Mark as processed
      event.processed = true;

    } catch (error) {
      console.error('Event processing error:', error);
      // Try to at least log to console for critical events
      if (event.severity === 'critical') {
        console.error('CRITICAL SECURITY EVENT:', {
          type: event.eventType,
          message: event.message,
          userId: event.userId,
          ipAddress: event.ipAddress,
          timestamp: event.timestamp,
        });
      }
    }
  }

  /**
   * Persist event to database
   */
  private async persistEvent(event: SecurityEvent): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Cannot persist security event - Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          id: event.id,
          event_type: event.eventType,
          severity: event.severity,
          user_id: event.userId,
          session_id: event.sessionId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          geolocation: event.geolocation,
          device_fingerprint: event.deviceFingerprint,
          message: event.message,
          details: event.details,
          metadata: event.metadata,
          threat_score: event.threatScore,
          risk_level: event.riskLevel,
          requires_action: event.requiresAction,
          processed: event.processed,
          alert_sent: event.alertSent,
          acknowledged: event.acknowledged,
          correlation_id: event.correlationId,
          parent_event_id: event.parentEventId,
          related_events: event.relatedEvents,
          created_at: event.createdAt,
          expires_at: event.expiresAt,
        });

      if (error) {
        console.error('Failed to persist security event:', error);
      }
    } catch (error) {
      console.error('Database error persisting security event:', error);
    }
  }

  /**
   * Add event to buffer for batch processing
   */
  private addToBuffer(event: SecurityEvent): void {
    eventBuffer.push(event);
    
    if (eventBuffer.length >= SECURITY_CONFIG.batching.size) {
      this.flushBuffer();
    }
  }

  /**
   * Flush buffer to database
   */
  private async flushBuffer(): Promise<void> {
    if (processingBuffer || eventBuffer.length === 0) {
      return;
    }

    processingBuffer = true;
    const eventsToProcess = [...eventBuffer];
    eventBuffer = [];

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn('Cannot flush security events - Supabase not configured');
        return;
      }

      const insertData = eventsToProcess.map(event => ({
        id: event.id,
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId,
        session_id: event.sessionId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        geolocation: event.geolocation,
        device_fingerprint: event.deviceFingerprint,
        message: event.message,
        details: event.details,
        metadata: event.metadata,
        threat_score: event.threatScore,
        risk_level: event.riskLevel,
        requires_action: event.requiresAction,
        processed: event.processed,
        alert_sent: event.alertSent,
        acknowledged: event.acknowledged,
        correlation_id: event.correlationId,
        parent_event_id: event.parentEventId,
        related_events: event.relatedEvents,
        created_at: event.createdAt,
        expires_at: event.expiresAt,
      }));

      const { error } = await supabase
        .from('security_events')
        .insert(insertData);

      if (error) {
        console.error('Batch insert failed:', error);
        // Re-add events to buffer for retry
        eventBuffer.unshift(...eventsToProcess);
      }
    } catch (error) {
      console.error('Buffer flush error:', error);
      // Re-add events to buffer for retry
      eventBuffer.unshift(...eventsToProcess);
    } finally {
      processingBuffer = false;
    }
  }

  /**
   * Start batch processing interval
   */
  private startBatchProcessing(): void {
    setInterval(() => {
      this.flushBuffer();
    }, SECURITY_CONFIG.batching.interval);
  }

  /**
   * Real-time threat processing
   */
  private async realTimeProcessing(event: SecurityEvent): Promise<void> {
    try {
      // Pattern matching for known attack signatures
      await this.checkThreatPatterns(event);
      
      // Behavioral analysis
      await this.behavioralAnalysis(event);
      
      // Anomaly detection
      await this.anomalyDetection(event);
      
    } catch (error) {
      console.error('Real-time processing error:', error);
    }
  }

  /**
   * Check for threat patterns
   */
  private async checkThreatPatterns(event: SecurityEvent): Promise<void> {
    // Brute force detection
    if (event.eventType === 'auth_login_failure') {
      const recentFailures = await this.getRecentEvents('auth_login_failure', {
        ipAddress: event.ipAddress,
        timeWindow: 300000, // 5 minutes
      });
      
      if (recentFailures >= 5) {
        await this.logEvent('threat_brute_force_detected', {
          message: `Brute force attack detected from ${event.ipAddress}`,
          metadata: {
            failureCount: recentFailures,
            timeWindow: 300000,
            attackTarget: event.userId || 'unknown',
          },
          correlationId: event.correlationId,
          parentEventId: event.id,
        });
      }
    }

    // Session hijacking detection
    if (event.eventType === 'session_device_change' || event.eventType === 'session_location_change') {
      const suspiciousChanges = await this.getRecentEvents(['session_device_change', 'session_location_change'], {
        userId: event.userId,
        sessionId: event.sessionId,
        timeWindow: 60000, // 1 minute
      });
      
      if (suspiciousChanges >= 2) {
        await this.logEvent('auth_session_hijack_detected', {
          message: `Potential session hijacking detected for user ${event.userId}`,
          metadata: {
            sessionId: event.sessionId,
            changeCount: suspiciousChanges,
            deviceFingerprint: event.deviceFingerprint,
          },
          correlationId: event.correlationId,
          parentEventId: event.id,
        });
      }
    }
  }

  /**
   * Behavioral analysis
   */
  private async behavioralAnalysis(event: SecurityEvent): Promise<void> {
    if (!event.userId) return;

    // Get user's typical behavior patterns
    const userHistory = await this.getUserBehaviorHistory(event.userId, 30); // 30 days
    
    // Analyze for anomalies
    const anomalies: string[] = [];
    
    // Time-based anomalies
    const eventHour = new Date(event.timestamp).getHours();
    const typicalHours = userHistory.typicalLoginHours || [];
    if (typicalHours.length > 0 && !typicalHours.includes(eventHour)) {
      anomalies.push('unusual_time');
    }
    
    // Location-based anomalies
    if (event.geolocation && userHistory.typicalCountries) {
      if (!userHistory.typicalCountries.includes(event.geolocation.country)) {
        anomalies.push('unusual_location');
      }
    }
    
    // Device-based anomalies
    if (event.deviceFingerprint && userHistory.knownDevices) {
      const isKnownDevice = userHistory.knownDevices.some(device => 
        device.fingerprint === event.deviceFingerprint?.fingerprint
      );
      if (!isKnownDevice) {
        anomalies.push('unknown_device');
      }
    }
    
    if (anomalies.length > 0) {
      await this.logEvent('threat_anomalous_behavior', {
        message: `Anomalous behavior detected for user ${event.userId}`,
        metadata: {
          anomalies,
          userHistory: {
            accountAge: userHistory.accountAge,
            typicalHours: userHistory.typicalLoginHours,
            typicalCountries: userHistory.typicalCountries,
          },
        },
        correlationId: event.correlationId,
        parentEventId: event.id,
      });
    }
  }

  /**
   * Anomaly detection using statistical methods
   */
  private async anomalyDetection(event: SecurityEvent): Promise<void> {
    // Implement statistical anomaly detection
    // This is a simplified version - in production, use proper ML models
    
    const recentEvents = await this.getRecentSystemEvents(3600000); // 1 hour
    const eventCounts = recentEvents.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const currentTypeCount = eventCounts[event.eventType] || 0;
    const averageCount = Object.values(eventCounts).reduce((a, b) => a + b, 0) / Object.keys(eventCounts).length;
    
    // Simple threshold-based anomaly detection
    if (currentTypeCount > averageCount * 3) {
      await this.logEvent('security_alert_triggered', {
        message: `Anomalous spike in ${event.eventType} events detected`,
        metadata: {
          currentCount: currentTypeCount,
          averageCount,
          threshold: averageCount * 3,
          timeWindow: '1 hour',
        },
      });
    }
  }

  /**
   * Handle immediate threats
   */
  private async handleImmediateThreat(event: SecurityEvent): Promise<void> {
    console.warn('IMMEDIATE THREAT DETECTED:', {
      type: event.eventType,
      severity: event.severity,
      threatScore: event.threatScore,
      userId: event.userId,
      ipAddress: event.ipAddress,
    });

    // In production, this would trigger immediate defensive actions:
    // - Block IP address
    // - Invalidate sessions
    // - Trigger security team alerts
    // - Update security rules
  }

  /**
   * Generate security alert
   */
  private async generateAlert(event: SecurityEvent): Promise<void> {
    const alert: SecurityAlert = {
      id: generateUUID(),
      eventId: event.id,
      alertType: 'slack', // Default to Slack, can be configured
      title: `Security Alert: ${event.eventType}`,
      description: event.message,
      severity: event.severity,
      recipients: this.getAlertRecipients(event.severity),
      acknowledged: false,
      escalated: false,
      resolved: false,
      metadata: {
        threatScore: event.threatScore,
        riskLevel: event.riskLevel,
        userId: event.userId,
        ipAddress: event.ipAddress,
      },
    };

    // Send alert (implementation depends on alert type)
    await this.sendAlert(alert);
    
    // Mark event as alerted
    event.alertSent = true;
  }

  /**
   * Calculate threat score based on various factors
   */
  private calculateThreatScore(
    eventType: SecurityEventType,
    context: any,
    geolocation?: GeoLocation,
    deviceFingerprint?: DeviceFingerprint
  ): number {
    let score = 0;

    // Base score by event type
    const baseScores: Record<SecurityEventType, number> = {
      'auth_login_failure': THREAT_SCORE_WEIGHTS.FAILED_LOGIN,
      'threat_brute_force_detected': THREAT_SCORE_WEIGHTS.BRUTE_FORCE,
      'threat_credential_stuffing': THREAT_SCORE_WEIGHTS.CREDENTIAL_STUFFING,
      'csrf_attack_detected': THREAT_SCORE_WEIGHTS.CSRF_VIOLATION,
      'admin_privilege_escalation': THREAT_SCORE_WEIGHTS.PRIVILEGE_ESCALATION,
      'rate_limit_exceeded': THREAT_SCORE_WEIGHTS.RATE_LIMITING,
      // Add more mappings as needed
    } as any;

    score += baseScores[eventType] || 5; // Default low score

    // Geographic risk factors
    if (geolocation?.country) {
      const highRiskCountries = ['CN', 'RU', 'IR', 'KP'];
      if (highRiskCountries.includes(geolocation.country)) {
        score += THREAT_SCORE_WEIGHTS.SUSPICIOUS_LOCATION;
      }
    }

    // Device fingerprint risk factors
    if (deviceFingerprint?.userAgent) {
      const suspiciousPatterns = [/curl/i, /wget/i, /python/i, /bot/i];
      if (suspiciousPatterns.some(pattern => pattern.test(deviceFingerprint.userAgent))) {
        score += THREAT_SCORE_WEIGHTS.BOT_DETECTION;
      }
    }

    // Time-based risk factors
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 6) { // Late night/early morning
      score += THREAT_SCORE_WEIGHTS.TIME_ANOMALY;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate risk level based on threat score and severity
   */
  private calculateRiskLevel(threatScore: number, severity: SecurityEventSeverity): 'low' | 'medium' | 'high' | 'critical' {
    if (severity === 'critical' || threatScore >= 80) return 'critical';
    if (severity === 'high' || threatScore >= 60) return 'high';
    if (severity === 'medium' || threatScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Determine if event requires immediate action
   */
  private requiresAction(eventType: SecurityEventType, threatScore: number, severity: SecurityEventSeverity): boolean {
    const actionRequiredEvents: SecurityEventType[] = [
      'auth_session_hijack_detected',
      'session_theft_detected',
      'threat_brute_force_detected',
      'csrf_attack_detected',
      'admin_privilege_escalation',
      'security_log_tampering',
    ];

    return actionRequiredEvents.includes(eventType) || 
           severity === 'critical' || 
           threatScore >= 70;
  }

  /**
   * Determine if event should trigger an alert
   */
  private shouldAlert(event: SecurityEvent): boolean {
    return event.severity === 'critical' || 
           event.severity === 'high' || 
           event.threatScore >= 60 ||
           event.requiresAction;
  }

  /**
   * Helper methods
   */
  private getDefaultMessage(eventType: SecurityEventType): string {
    const messages: Record<SecurityEventType, string> = {
      'auth_login_success': 'User login successful',
      'auth_login_failure': 'User login failed',
      'auth_logout': 'User logout',
      'session_created': 'New session created',
      'csrf_token_invalid': 'CSRF token validation failed',
      'rate_limit_exceeded': 'Rate limit exceeded',
      // Add more default messages
    } as any;

    return messages[eventType] || `Security event: ${eventType}`;
  }

  private async getGeolocation(ipAddress: string): Promise<GeoLocation | undefined> {
    // In production, integrate with a geolocation service like MaxMind or ipinfo.io
    // For now, return undefined
    return undefined;
  }

  private generateDeviceFingerprint(request?: NextRequest): DeviceFingerprint | undefined {
    if (!request) return undefined;

    return {
      userAgent: request.headers.get('user-agent') || '',
      // In a real implementation, collect more fingerprinting data
    };
  }

  private getRequestId(request: NextRequest): string {
    return request.headers.get('x-request-id') || generateUUID();
  }

  private calculateExpiryDate(severity: SecurityEventSeverity): string {
    const days = SECURITY_CONFIG.retention[severity];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate.toISOString();
  }

  private addToCorrelation(correlationId: string, eventId: string): void {
    if (!this.correlationMap.has(correlationId)) {
      this.correlationMap.set(correlationId, []);
    }
    this.correlationMap.get(correlationId)!.push(eventId);
  }

  private updatePerformanceMetrics(processingTime: number): void {
    this.performanceMetrics.eventsLogged++;
    this.performanceMetrics.totalProcessingTime += processingTime;
    this.performanceMetrics.averageProcessingTime = 
      this.performanceMetrics.totalProcessingTime / this.performanceMetrics.eventsLogged;
  }

  private getAlertRecipients(severity: SecurityEventSeverity): string[] {
    // Configuration-based recipient mapping
    const recipients = {
      low: [],
      medium: ['security@company.com'],
      high: ['security@company.com', 'admin@company.com'],
      critical: ['security@company.com', 'admin@company.com', 'cto@company.com'],
    };

    return recipients[severity] || [];
  }

  private async sendAlert(alert: SecurityAlert): Promise<void> {
    // Implementation depends on alert type (email, Slack, etc.)
    console.log('SECURITY ALERT:', alert);
  }

  // Placeholder methods for database queries (implement based on your needs)
  private async getRecentEvents(eventType: SecurityEventType | SecurityEventType[], filters: any): Promise<number> {
    // Implement database query to count recent events
    return 0;
  }

  private async getUserBehaviorHistory(userId: string, days: number): Promise<any> {
    // Implement database query to get user behavior history
    return {};
  }

  private async getRecentSystemEvents(timeWindow: number): Promise<any[]> {
    // Implement database query to get recent system events
    return [];
  }

  /**
   * Public API methods
   */
  public getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  public async flushEvents(): Promise<void> {
    await this.flushBuffer();
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();

// Convenience functions for common security events
export const logSecurityEvent = securityLogger.logEvent.bind(securityLogger);

export const logAuthEvent = (
  eventType: Extract<SecurityEventType, 'auth_login_success' | 'auth_login_failure' | 'auth_logout'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);

export const logSessionEvent = (
  eventType: Extract<SecurityEventType, 'session_created' | 'session_destroyed' | 'session_timeout'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);

export const logCSRFEvent = (
  eventType: Extract<SecurityEventType, 'csrf_token_invalid' | 'csrf_token_missing' | 'csrf_attack_detected'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);

export const logRateLimitEvent = (
  eventType: Extract<SecurityEventType, 'rate_limit_exceeded' | 'rate_limit_blocked'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);

export const logAdminEvent = (
  eventType: Extract<SecurityEventType, 'admin_login' | 'admin_privilege_escalation' | 'admin_config_change'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);

export const logThreatEvent = (
  eventType: Extract<SecurityEventType, 'threat_brute_force_detected' | 'threat_credential_stuffing' | 'threat_anomalous_behavior'>,
  context: Parameters<typeof securityLogger.logEvent>[1]
) => securityLogger.logEvent(eventType, context);