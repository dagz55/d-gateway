/**
 * Security Analytics and Real-time Analysis
 * Comprehensive analytics and monitoring for security events
 */

import { createClient } from '@supabase/supabase-js';
import { 
  SecurityEvent, 
  SecurityEventType, 
  SecurityEventSeverity,
  SecurityMetrics,
  SecurityEventFilter,
  SecurityAlert
} from './security-events';
import { threatDetection } from './threat-detection';

/**
 * Security Analytics Engine
 */
export class SecurityAnalytics {
  private static instance: SecurityAnalytics;
  private supabaseClient: any;
  private metricsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {
    this.initializeSupabase();
  }

  public static getInstance(): SecurityAnalytics {
    if (!SecurityAnalytics.instance) {
      SecurityAnalytics.instance = new SecurityAnalytics();
    }
    return SecurityAnalytics.instance;
  }

  private initializeSupabase(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Get comprehensive security metrics
   */
  public async getSecurityMetrics(timeframe: string = '24h'): Promise<SecurityMetrics> {
    const cacheKey = `metrics_${timeframe}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const timeframeMs = this.parseTimeframe(timeframe);
      const startTime = new Date(Date.now() - timeframeMs).toISOString();

      const metrics: SecurityMetrics = {
        timeframe,
        totalEvents: 0,
        eventsByType: {} as Record<SecurityEventType, number>,
        eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        threatScoreDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        topThreatSources: [],
        authenticationMetrics: {
          successfulLogins: 0,
          failedLogins: 0,
          successRate: 0,
          averageSessionDuration: 0,
        },
        rateLimitingMetrics: {
          totalBlocked: 0,
          byEndpoint: {},
          byIpAddress: {},
        },
        csrfMetrics: {
          validations: 0,
          failures: 0,
          attacks: 0,
        },
        anomalyDetection: {
          detected: 0,
          falsePositives: 0,
          accuracy: 0,
        },
      };

      if (!this.supabaseClient) {
        console.warn('Supabase not configured for security analytics');
        return metrics;
      }

      // Get all events in timeframe
      const { data: events, error } = await this.supabaseClient
        .from('security_events')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch security events:', error);
        return metrics;
      }

      // Process events
      metrics.totalEvents = events.length;
      this.processEventMetrics(events, metrics);
      await this.calculateAuthenticationMetrics(metrics, startTime);
      await this.calculateRateLimitingMetrics(metrics, startTime);
      await this.calculateCSRFMetrics(metrics, startTime);
      await this.calculateAnomalyMetrics(metrics, startTime);

      // Cache results
      this.metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now(),
      });

      return metrics;
    } catch (error) {
      console.error('Error calculating security metrics:', error);
      throw error;
    }
  }

  /**
   * Get security events with filtering
   */
  public async getSecurityEvents(filter: SecurityEventFilter = {}): Promise<SecurityEvent[]> {
    if (!this.supabaseClient) {
      console.warn('Supabase not configured for security analytics');
      return [];
    }

    try {
      let query = this.supabaseClient.from('security_events').select('*');

      // Apply filters
      if (filter.eventTypes?.length) {
        query = query.in('event_type', filter.eventTypes);
      }

      if (filter.severities?.length) {
        query = query.in('severity', filter.severities);
      }

      if (filter.userIds?.length) {
        query = query.in('user_id', filter.userIds);
      }

      if (filter.ipAddresses?.length) {
        query = query.in('ip_address', filter.ipAddresses);
      }

      if (filter.timeRange) {
        query = query
          .gte('created_at', filter.timeRange.start)
          .lte('created_at', filter.timeRange.end);
      }

      if (filter.threatScoreMin !== undefined) {
        query = query.gte('threat_score', filter.threatScoreMin);
      }

      if (filter.threatScoreMax !== undefined) {
        query = query.lte('threat_score', filter.threatScoreMax);
      }

      if (filter.requiresAction !== undefined) {
        query = query.eq('requires_action', filter.requiresAction);
      }

      if (filter.processed !== undefined) {
        query = query.eq('processed', filter.processed);
      }

      // Apply sorting
      const sortBy = filter.sortBy || 'timestamp';
      const sortOrder = filter.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
      query = query.order(sortBy === 'timestamp' ? 'created_at' : sortBy, sortOrder);

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Failed to fetch filtered security events:', error);
        return [];
      }

      return events.map(this.transformEventFromDB);
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }

  /**
   * Get real-time threat analysis
   */
  public async getRealTimeThreatAnalysis(): Promise<RealTimeThreatData> {
    try {
      const last24Hours = new Date(Date.now() - 86400000).toISOString();
      const lastHour = new Date(Date.now() - 3600000).toISOString();
      const last15Minutes = new Date(Date.now() - 900000).toISOString();

      const [
        activeThreatSources,
        recentHighSeverityEvents,
        authenticationTrends,
        systemHealthMetrics
      ] = await Promise.all([
        this.getActiveThreatSources(),
        this.getRecentHighSeverityEvents(lastHour),
        this.getAuthenticationTrends(last24Hours),
        this.getSystemHealthMetrics(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        activeThreatSources,
        recentHighSeverityEvents,
        authenticationTrends,
        systemHealthMetrics,
        alertsGenerated: await this.getActiveAlerts(),
        riskLevel: this.calculateSystemRiskLevel(activeThreatSources, recentHighSeverityEvents),
      };
    } catch (error) {
      console.error('Error getting real-time threat analysis:', error);
      throw error;
    }
  }

  /**
   * Generate security report
   */
  public async generateSecurityReport(
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string
  ): Promise<SecurityReport> {
    try {
      const timeframes = this.getReportTimeframes(period, startDate);
      const metrics = await this.getSecurityMetrics(timeframes.current);
      const previousMetrics = await this.getSecurityMetrics(timeframes.previous);

      const report: SecurityReport = {
        id: `report_${period}_${Date.now()}`,
        period,
        generatedAt: new Date().toISOString(),
        timeRange: timeframes,
        summary: this.generateReportSummary(metrics, previousMetrics),
        metrics,
        trends: this.calculateTrends(metrics, previousMetrics),
        topThreats: await this.getTopThreats(timeframes.current),
        recommendations: await this.generateSecurityRecommendations(metrics),
        compliance: await this.getComplianceMetrics(timeframes.current),
      };

      return report;
    } catch (error) {
      console.error('Error generating security report:', error);
      throw error;
    }
  }

  /**
   * Get security dashboard data
   */
  public async getDashboardData(): Promise<SecurityDashboardData> {
    try {
      const [
        metrics,
        recentEvents,
        activeThreatSources,
        systemHealth,
        alerts
      ] = await Promise.all([
        this.getSecurityMetrics('24h'),
        this.getSecurityEvents({
          limit: 20,
          sortBy: 'timestamp',
          sortOrder: 'desc',
        }),
        this.getActiveThreatSources(),
        this.getSystemHealthMetrics(),
        this.getActiveAlerts(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        metrics,
        recentEvents,
        activeThreatSources,
        systemHealth,
        alerts,
        charts: await this.generateChartData(metrics),
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Analyze user security profile
   */
  public async analyzeUserSecurity(userId: string): Promise<UserSecurityProfile> {
    try {
      const userEvents = await this.getSecurityEvents({
        userIds: [userId],
        timeRange: {
          start: new Date(Date.now() - 2592000000).toISOString(), // 30 days
          end: new Date().toISOString(),
        },
      });

      const profile: UserSecurityProfile = {
        userId,
        analyzedAt: new Date().toISOString(),
        riskScore: this.calculateUserRiskScore(userEvents),
        securityEvents: {
          total: userEvents.length,
          byType: this.groupEventsByType(userEvents),
          bySeverity: this.groupEventsBySeverity(userEvents),
        },
        behaviorAnalysis: await this.analyzeBehaviorPattern(userId, userEvents),
        deviceAnalysis: this.analyzeDeviceUsage(userEvents),
        locationAnalysis: this.analyzeLocationPattern(userEvents),
        threats: this.identifyUserThreats(userEvents),
        recommendations: this.generateUserRecommendations(userEvents),
      };

      return profile;
    } catch (error) {
      console.error('Error analyzing user security:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private processEventMetrics(events: any[], metrics: SecurityMetrics): void {
    const threatScoreRanges = { low: 0, medium: 0, high: 0, critical: 0 };
    const ipCounts = new Map<string, number>();

    events.forEach(event => {
      // Count by type
      const eventType = event.event_type as SecurityEventType;
      metrics.eventsByType[eventType] = (metrics.eventsByType[eventType] || 0) + 1;

      // Count by severity
      metrics.eventsBySeverity[event.severity as SecurityEventSeverity]++;

      // Count by threat score range
      const score = event.threat_score || 0;
      if (score >= 80) threatScoreRanges.critical++;
      else if (score >= 60) threatScoreRanges.high++;
      else if (score >= 30) threatScoreRanges.medium++;
      else threatScoreRanges.low++;

      // Count by IP
      if (event.ip_address) {
        ipCounts.set(event.ip_address, (ipCounts.get(event.ip_address) || 0) + 1);
      }
    });

    metrics.threatScoreDistribution = threatScoreRanges;

    // Get top threat sources
    metrics.topThreatSources = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ipAddress, count]) => ({
        ipAddress,
        count,
        threatScore: this.calculateIPThreatScore(events, ipAddress),
      }));
  }

  private async calculateAuthenticationMetrics(metrics: SecurityMetrics, startTime: string): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      const [successResult, failureResult] = await Promise.all([
        this.supabaseClient
          .from('security_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'auth_login_success')
          .gte('created_at', startTime),
        this.supabaseClient
          .from('security_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'auth_login_failure')
          .gte('created_at', startTime),
      ]);

      const successful = successResult.count || 0;
      const failed = failureResult.count || 0;
      const total = successful + failed;

      metrics.authenticationMetrics = {
        successfulLogins: successful,
        failedLogins: failed,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        averageSessionDuration: await this.calculateAverageSessionDuration(startTime),
      };
    } catch (error) {
      console.error('Error calculating authentication metrics:', error);
    }
  }

  private async calculateRateLimitingMetrics(metrics: SecurityMetrics, startTime: string): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      const { data: rateLimitEvents } = await this.supabaseClient
        .from('security_events')
        .select('*')
        .eq('event_type', 'rate_limit_exceeded')
        .gte('created_at', startTime);

      const byEndpoint: Record<string, number> = {};
      const byIpAddress: Record<string, number> = {};

      (rateLimitEvents || []).forEach((event: any) => {
        const endpoint = event.metadata?.endpoint || 'unknown';
        const ip = event.ip_address || 'unknown';

        byEndpoint[endpoint] = (byEndpoint[endpoint] || 0) + 1;
        byIpAddress[ip] = (byIpAddress[ip] || 0) + 1;
      });

      metrics.rateLimitingMetrics = {
        totalBlocked: rateLimitEvents?.length || 0,
        byEndpoint,
        byIpAddress,
      };
    } catch (error) {
      console.error('Error calculating rate limiting metrics:', error);
    }
  }

  private async calculateCSRFMetrics(metrics: SecurityMetrics, startTime: string): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      const [validationsResult, failuresResult, attacksResult] = await Promise.all([
        this.supabaseClient
          .from('security_events')
          .select('*', { count: 'exact' })
          .in('event_type', ['csrf_token_invalid', 'csrf_token_missing'])
          .gte('created_at', startTime),
        this.supabaseClient
          .from('security_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'csrf_token_invalid')
          .gte('created_at', startTime),
        this.supabaseClient
          .from('security_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'csrf_attack_detected')
          .gte('created_at', startTime),
      ]);

      metrics.csrfMetrics = {
        validations: validationsResult.count || 0,
        failures: failuresResult.count || 0,
        attacks: attacksResult.count || 0,
      };
    } catch (error) {
      console.error('Error calculating CSRF metrics:', error);
    }
  }

  private async calculateAnomalyMetrics(metrics: SecurityMetrics, startTime: string): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      const { data: anomalyEvents } = await this.supabaseClient
        .from('security_events')
        .select('*')
        .eq('event_type', 'threat_anomalous_behavior')
        .gte('created_at', startTime);

      // For now, assume 5% false positive rate
      const detected = anomalyEvents?.length || 0;
      const falsePositives = Math.round(detected * 0.05);

      metrics.anomalyDetection = {
        detected,
        falsePositives,
        accuracy: detected > 0 ? ((detected - falsePositives) / detected) * 100 : 0,
      };
    } catch (error) {
      console.error('Error calculating anomaly metrics:', error);
    }
  }

  private parseTimeframe(timeframe: string): number {
    const multipliers: Record<string, number> = {
      '1h': 3600000,
      '6h': 21600000,
      '12h': 43200000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    };

    return multipliers[timeframe] || 86400000; // Default to 24h
  }

  private calculateIPThreatScore(events: any[], ipAddress: string): number {
    const ipEvents = events.filter(e => e.ip_address === ipAddress);
    const totalScore = ipEvents.reduce((sum, event) => sum + (event.threat_score || 0), 0);
    return ipEvents.length > 0 ? totalScore / ipEvents.length : 0;
  }

  private async calculateAverageSessionDuration(startTime: string): Promise<number> {
    // This would require session tracking data
    // For now, return a placeholder value
    return 1800; // 30 minutes in seconds
  }

  private transformEventFromDB(dbEvent: any): SecurityEvent {
    return {
      id: dbEvent.id,
      timestamp: dbEvent.created_at,
      eventType: dbEvent.event_type,
      severity: dbEvent.severity,
      userId: dbEvent.user_id,
      email: dbEvent.metadata?.email,
      username: dbEvent.metadata?.username,
      sessionId: dbEvent.session_id,
      ipAddress: dbEvent.ip_address,
      userAgent: dbEvent.user_agent,
      geolocation: dbEvent.geolocation,
      deviceFingerprint: dbEvent.device_fingerprint,
      message: dbEvent.message,
      details: dbEvent.details,
      metadata: dbEvent.metadata || {},
      threatScore: dbEvent.threat_score,
      riskLevel: dbEvent.risk_level,
      requiresAction: dbEvent.requires_action,
      processed: dbEvent.processed,
      alertSent: dbEvent.alert_sent,
      acknowledged: dbEvent.acknowledged,
      correlationId: dbEvent.correlation_id,
      parentEventId: dbEvent.parent_event_id,
      relatedEvents: dbEvent.related_events || [],
      createdAt: dbEvent.created_at,
      expiresAt: dbEvent.expires_at,
    };
  }

  private async getActiveThreatSources(): Promise<ThreatSource[]> {
    const threatSources = threatDetection.getSuspiciousIPs();
    return threatSources.map(ip => ({
      ipAddress: ip.ipAddress,
      threatScore: ip.threatScore,
      firstSeen: new Date(ip.firstSeen).toISOString(),
      lastSeen: new Date(ip.lastSeen).toISOString(),
      eventCount: ip.failedAttempts.length,
      isBlocked: ip.blocked,
    }));
  }

  private async getRecentHighSeverityEvents(since: string): Promise<SecurityEvent[]> {
    return this.getSecurityEvents({
      severities: ['high', 'critical'],
      timeRange: {
        start: since,
        end: new Date().toISOString(),
      },
      limit: 50,
    });
  }

  private async getAuthenticationTrends(since: string): Promise<AuthenticationTrend[]> {
    // Implement authentication trend analysis
    return [];
  }

  private async getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
      securitySystemStatus: 'operational',
      lastHealthCheck: new Date().toISOString(),
    };
  }

  private async getActiveAlerts(): Promise<SecurityAlert[]> {
    if (!this.supabaseClient) return [];

    try {
      const { data: alerts } = await this.supabaseClient
        .from('security_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      return alerts || [];
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      return [];
    }
  }

  private calculateSystemRiskLevel(
    threatSources: ThreatSource[],
    recentEvents: SecurityEvent[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highThreatSources = threatSources.filter(t => t.threatScore > 70).length;

    if (criticalEvents > 0 || highThreatSources > 3) return 'critical';
    if (recentEvents.filter(e => e.severity === 'high').length > 5) return 'high';
    if (threatSources.length > 10) return 'medium';
    return 'low';
  }

  private getReportTimeframes(period: string, startDate?: string) {
    // Implementation for report timeframes
    const now = new Date();
    const current = `${period}_current`;
    const previous = `${period}_previous`;
    
    return { current, previous };
  }

  private generateReportSummary(current: SecurityMetrics, previous: SecurityMetrics): string {
    return `Security report summary for ${current.timeframe}`;
  }

  private calculateTrends(current: SecurityMetrics, previous: SecurityMetrics): any {
    return {};
  }

  private async getTopThreats(timeframe: string): Promise<any[]> {
    return [];
  }

  private async generateSecurityRecommendations(metrics: SecurityMetrics): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (metrics.authenticationMetrics.successRate < 80) {
      recommendations.push('Consider implementing stronger authentication measures');
    }
    
    if (metrics.rateLimitingMetrics.totalBlocked > 100) {
      recommendations.push('Review and adjust rate limiting policies');
    }
    
    return recommendations;
  }

  private async getComplianceMetrics(timeframe: string): Promise<any> {
    return {};
  }

  private async generateChartData(metrics: SecurityMetrics): Promise<any> {
    return {};
  }

  private calculateUserRiskScore(events: SecurityEvent[]): number {
    if (events.length === 0) return 0;
    
    const totalScore = events.reduce((sum, event) => sum + event.threatScore, 0);
    return Math.min(totalScore / events.length, 100);
  }

  private groupEventsByType(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEventsBySeverity(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async analyzeBehaviorPattern(userId: string, events: SecurityEvent[]): Promise<any> {
    return {};
  }

  private analyzeDeviceUsage(events: SecurityEvent[]): any {
    return {};
  }

  private analyzeLocationPattern(events: SecurityEvent[]): any {
    return {};
  }

  private identifyUserThreats(events: SecurityEvent[]): any[] {
    return [];
  }

  private generateUserRecommendations(events: SecurityEvent[]): string[] {
    return [];
  }
}

// Type definitions
interface RealTimeThreatData {
  timestamp: string;
  activeThreatSources: ThreatSource[];
  recentHighSeverityEvents: SecurityEvent[];
  authenticationTrends: AuthenticationTrend[];
  systemHealthMetrics: SystemHealthMetrics;
  alertsGenerated: SecurityAlert[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ThreatSource {
  ipAddress: string;
  threatScore: number;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  isBlocked: boolean;
}

interface AuthenticationTrend {
  hour: string;
  successful: number;
  failed: number;
  successRate: number;
}

interface SystemHealthMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  securitySystemStatus: 'operational' | 'degraded' | 'offline';
  lastHealthCheck: string;
}

interface SecurityReport {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  timeRange: any;
  summary: string;
  metrics: SecurityMetrics;
  trends: any;
  topThreats: any[];
  recommendations: string[];
  compliance: any;
}

interface SecurityDashboardData {
  timestamp: string;
  metrics: SecurityMetrics;
  recentEvents: SecurityEvent[];
  activeThreatSources: ThreatSource[];
  systemHealth: SystemHealthMetrics;
  alerts: SecurityAlert[];
  charts: any;
}

interface UserSecurityProfile {
  userId: string;
  analyzedAt: string;
  riskScore: number;
  securityEvents: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  behaviorAnalysis: any;
  deviceAnalysis: any;
  locationAnalysis: any;
  threats: any[];
  recommendations: string[];
}

// Export singleton instance
export const securityAnalytics = SecurityAnalytics.getInstance();

// Convenience functions
export const getSecurityMetrics = securityAnalytics.getSecurityMetrics.bind(securityAnalytics);
export const getSecurityEvents = securityAnalytics.getSecurityEvents.bind(securityAnalytics);
export const getRealTimeThreatAnalysis = securityAnalytics.getRealTimeThreatAnalysis.bind(securityAnalytics);
export const generateSecurityReport = securityAnalytics.generateSecurityReport.bind(securityAnalytics);
export const getDashboardData = securityAnalytics.getDashboardData.bind(securityAnalytics);
export const analyzeUserSecurity = securityAnalytics.analyzeUserSecurity.bind(securityAnalytics);