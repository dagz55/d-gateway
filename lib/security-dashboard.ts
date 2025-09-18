/**
 * Security Dashboard Utilities
 * Dashboard data processing and visualization utilities for security monitoring
 */

import { 
  SecurityEvent, 
  SecurityEventType, 
  SecurityEventSeverity,
  SecurityMetrics,
  SecurityDashboardConfig
} from './security-events';
import { securityAnalytics } from './security-analytics';
import { threatDetection } from './threat-detection';

/**
 * Security Dashboard Manager
 */
export class SecurityDashboard {
  private static instance: SecurityDashboard;
  private config: SecurityDashboardConfig;
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): SecurityDashboard {
    if (!SecurityDashboard.instance) {
      SecurityDashboard.instance = new SecurityDashboard();
    }
    return SecurityDashboard.instance;
  }

  /**
   * Get real-time dashboard data
   */
  public async getDashboardData(): Promise<DashboardData> {
    try {
      const [
        metrics,
        recentEvents,
        threatSources,
        systemHealth,
        alerts,
        trends
      ] = await Promise.all([
        securityAnalytics.getSecurityMetrics('24h'),
        securityAnalytics.getSecurityEvents({
          limit: 50,
          sortBy: 'timestamp',
          sortOrder: 'desc',
        }),
        this.getActiveThreatSources(),
        this.getSystemHealth(),
        this.getActiveAlerts(),
        this.getTrendData(),
      ]);

      const charts = this.generateChartData(metrics, recentEvents, trends);
      const widgets = this.generateWidgetData(metrics, recentEvents, threatSources);

      return {
        timestamp: new Date().toISOString(),
        overview: this.generateOverview(metrics, recentEvents),
        metrics,
        recentEvents: recentEvents.slice(0, 20), // Limit for dashboard
        threatSources,
        systemHealth,
        alerts,
        charts,
        widgets,
        summary: this.generateSummary(metrics, recentEvents),
      };
    } catch (error) {
      console.error('Error generating dashboard data:', error);
      throw error;
    }
  }

  /**
   * Generate chart data for various visualizations
   */
  public generateChartData(
    metrics: SecurityMetrics,
    events: SecurityEvent[],
    trends?: TrendData
  ): ChartData {
    return {
      eventsByType: this.generateEventTypeChart(metrics.eventsByType),
      eventsBySeverity: this.generateSeverityChart(metrics.eventsBySeverity),
      threatScoreDistribution: this.generateThreatScoreChart(metrics.threatScoreDistribution),
      timelineChart: this.generateTimelineChart(events),
      geoLocationChart: this.generateGeoChart(events),
      topThreatSources: this.generateThreatSourceChart(metrics.topThreatSources),
      authenticationTrends: this.generateAuthTrendChart(metrics.authenticationMetrics, trends),
      rateLimitingChart: this.generateRateLimitChart(metrics.rateLimitingMetrics),
      csrfChart: this.generateCSRFChart(metrics.csrfMetrics),
      anomalyChart: this.generateAnomalyChart(metrics.anomalyDetection),
    };
  }

  /**
   * Generate widget data for dashboard cards
   */
  public generateWidgetData(
    metrics: SecurityMetrics,
    events: SecurityEvent[],
    threatSources: ThreatSource[]
  ): WidgetData[] {
    return [
      {
        id: 'total-events',
        type: 'metric',
        title: 'Total Events (24h)',
        value: metrics.totalEvents,
        change: this.calculateChange(metrics.totalEvents, 0), // Would need historical data
        status: this.getStatusFromValue(metrics.totalEvents, 1000, 5000),
        icon: 'activity',
      },
      {
        id: 'critical-events',
        type: 'metric',
        title: 'Critical Events',
        value: metrics.eventsBySeverity.critical,
        change: 0,
        status: metrics.eventsBySeverity.critical > 0 ? 'critical' : 'good',
        icon: 'alert-triangle',
      },
      {
        id: 'active-threats',
        type: 'metric',
        title: 'Active Threat Sources',
        value: threatSources.length,
        change: 0,
        status: this.getStatusFromValue(threatSources.length, 5, 20),
        icon: 'shield-alert',
      },
      {
        id: 'auth-success-rate',
        type: 'metric',
        title: 'Auth Success Rate',
        value: Math.round(metrics.authenticationMetrics.successRate),
        change: 0,
        status: this.getStatusFromValue(metrics.authenticationMetrics.successRate, 95, 80, true),
        icon: 'check-circle',
        suffix: '%',
      },
      {
        id: 'failed-logins',
        type: 'metric',
        title: 'Failed Logins',
        value: metrics.authenticationMetrics.failedLogins,
        change: 0,
        status: this.getStatusFromValue(metrics.authenticationMetrics.failedLogins, 50, 200),
        icon: 'x-circle',
      },
      {
        id: 'rate-limited',
        type: 'metric',
        title: 'Rate Limited Requests',
        value: metrics.rateLimitingMetrics.totalBlocked,
        change: 0,
        status: this.getStatusFromValue(metrics.rateLimitingMetrics.totalBlocked, 100, 500),
        icon: 'clock',
      },
      {
        id: 'csrf-attacks',
        type: 'metric',
        title: 'CSRF Attacks',
        value: metrics.csrfMetrics.attacks,
        change: 0,
        status: metrics.csrfMetrics.attacks > 0 ? 'warning' : 'good',
        icon: 'shield',
      },
      {
        id: 'anomalies-detected',
        type: 'metric',
        title: 'Anomalies Detected',
        value: metrics.anomalyDetection.detected,
        change: 0,
        status: this.getStatusFromValue(metrics.anomalyDetection.detected, 10, 50),
        icon: 'trending-up',
      },
    ];
  }

  /**
   * Generate overview summary
   */
  public generateOverview(metrics: SecurityMetrics, events: SecurityEvent[]): DashboardOverview {
    const criticalEvents = events.filter(e => e.severity === 'critical');
    const highSeverityEvents = events.filter(e => e.severity === 'high');
    const requiresActionEvents = events.filter(e => e.requiresAction);

    return {
      securityStatus: this.calculateSecurityStatus(metrics, events),
      riskLevel: this.calculateRiskLevel(metrics, events),
      threatsBlocked: metrics.rateLimitingMetrics.totalBlocked + metrics.csrfMetrics.attacks,
      activeIncidents: criticalEvents.length + highSeverityEvents.length,
      pendingActions: requiresActionEvents.length,
      systemHealth: 'operational', // Would be calculated from system metrics
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate summary statistics
   */
  public generateSummary(metrics: SecurityMetrics, events: SecurityEvent[]): DashboardSummary {
    const timeGroups = this.groupEventsByTimeInterval(events, 'hour');
    const locationGroups = this.groupEventsByLocation(events);
    const deviceGroups = this.groupEventsByDevice(events);

    return {
      eventTrends: {
        hourly: timeGroups,
        peak: this.findPeakActivity(timeGroups),
        trend: this.calculateTrend(timeGroups),
      },
      geographicDistribution: locationGroups,
      deviceDistribution: deviceGroups,
      topEndpoints: this.getTopEndpoints(events),
      riskFactors: this.identifyRiskFactors(metrics, events),
      recommendations: this.generateRecommendations(metrics, events),
    };
  }

  /**
   * Start real-time updates
   */
  public startRealTimeUpdates(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      try {
        const data = await this.getDashboardData();
        this.notifySubscribers('dashboard-update', data);
      } catch (error) {
        console.error('Error in real-time dashboard update:', error);
      }
    }, this.config.refreshInterval);
  }

  /**
   * Stop real-time updates
   */
  public stopRealTimeUpdates(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Subscribe to dashboard updates
   */
  public subscribe(id: string, callback: (data: any) => void): void {
    this.subscribers.set(id, callback);
  }

  /**
   * Unsubscribe from dashboard updates
   */
  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  /**
   * Generate specific chart types
   */
  private generateEventTypeChart(eventsByType: Record<SecurityEventType, number>): ChartConfig {
    const data = Object.entries(eventsByType).map(([type, count]) => ({
      name: this.formatEventTypeName(type),
      value: count,
      color: this.getEventTypeColor(type as SecurityEventType),
    }));

    return {
      type: 'pie',
      title: 'Events by Type',
      data,
      options: {
        responsive: true,
        legend: { position: 'bottom' },
      },
    };
  }

  private generateSeverityChart(eventsBySeverity: Record<SecurityEventSeverity, number>): ChartConfig {
    const severityColors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#7C2D12',
    };

    const data = Object.entries(eventsBySeverity).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: severityColors[severity as SecurityEventSeverity],
    }));

    return {
      type: 'doughnut',
      title: 'Events by Severity',
      data,
      options: {
        responsive: true,
        cutout: '50%',
        legend: { position: 'right' },
      },
    };
  }

  private generateThreatScoreChart(distribution: SecurityMetrics['threatScoreDistribution']): ChartConfig {
    const data = [
      { name: 'Low (0-29)', value: distribution.low, color: '#10B981' },
      { name: 'Medium (30-59)', value: distribution.medium, color: '#F59E0B' },
      { name: 'High (60-79)', value: distribution.high, color: '#EF4444' },
      { name: 'Critical (80+)', value: distribution.critical, color: '#7C2D12' },
    ];

    return {
      type: 'bar',
      title: 'Threat Score Distribution',
      data,
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };
  }

  private generateTimelineChart(events: SecurityEvent[]): ChartConfig {
    const timeGroups = this.groupEventsByTimeInterval(events, 'hour');
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    const datasets = [
      {
        label: 'Critical',
        data: labels.map(hour => timeGroups.critical?.[hour] || 0),
        borderColor: '#7C2D12',
        backgroundColor: 'rgba(124, 45, 18, 0.1)',
      },
      {
        label: 'High',
        data: labels.map(hour => timeGroups.high?.[hour] || 0),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      {
        label: 'Medium',
        data: labels.map(hour => timeGroups.medium?.[hour] || 0),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      },
      {
        label: 'Low',
        data: labels.map(hour => timeGroups.low?.[hour] || 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
    ];

    return {
      type: 'line',
      title: 'Security Events Timeline (24h)',
      data: { labels, datasets },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };
  }

  private generateGeoChart(events: SecurityEvent[]): ChartConfig {
    const locationCounts = events.reduce((acc, event) => {
      const country = event.geolocation?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({
        name: country,
        value: count,
        color: this.getRandomColor(),
      }));

    return {
      type: 'worldMap',
      title: 'Geographic Distribution',
      data,
      options: {
        responsive: true,
      },
    };
  }

  private generateThreatSourceChart(topThreatSources: SecurityMetrics['topThreatSources']): ChartConfig {
    const data = topThreatSources.slice(0, 10).map(source => ({
      name: this.anonymizeIP(source.ipAddress),
      value: source.count,
      threatScore: source.threatScore,
      color: this.getThreatScoreColor(source.threatScore),
    }));

    return {
      type: 'horizontalBar',
      title: 'Top Threat Sources',
      data,
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
        },
      },
    };
  }

  private generateAuthTrendChart(
    authMetrics: SecurityMetrics['authenticationMetrics'],
    trends?: TrendData
  ): ChartConfig {
    // Generate hourly authentication trends
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const successData = hours.map(hour => trends?.authentication?.successful?.[hour] || 0);
    const failureData = hours.map(hour => trends?.authentication?.failed?.[hour] || 0);

    return {
      type: 'line',
      title: 'Authentication Trends',
      data: {
        labels: hours.map(h => `${h}:00`),
        datasets: [
          {
            label: 'Successful',
            data: successData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          },
          {
            label: 'Failed',
            data: failureData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };
  }

  private generateRateLimitChart(rateLimitMetrics: SecurityMetrics['rateLimitingMetrics']): ChartConfig {
    const endpointData = Object.entries(rateLimitMetrics.byEndpoint)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({
        name: endpoint,
        value: count,
        color: this.getRandomColor(),
      }));

    return {
      type: 'bar',
      title: 'Rate Limited Endpoints',
      data: endpointData,
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };
  }

  private generateCSRFChart(csrfMetrics: SecurityMetrics['csrfMetrics']): ChartConfig {
    const data = [
      { name: 'Valid', value: csrfMetrics.validations - csrfMetrics.failures, color: '#10B981' },
      { name: 'Failures', value: csrfMetrics.failures, color: '#F59E0B' },
      { name: 'Attacks', value: csrfMetrics.attacks, color: '#EF4444' },
    ];

    return {
      type: 'pie',
      title: 'CSRF Protection Status',
      data,
      options: {
        responsive: true,
        legend: { position: 'bottom' },
      },
    };
  }

  private generateAnomalyChart(anomalyMetrics: SecurityMetrics['anomalyDetection']): ChartConfig {
    const data = [
      { name: 'True Positives', value: anomalyMetrics.detected - anomalyMetrics.falsePositives, color: '#EF4444' },
      { name: 'False Positives', value: anomalyMetrics.falsePositives, color: '#F59E0B' },
    ];

    return {
      type: 'doughnut',
      title: 'Anomaly Detection Accuracy',
      data,
      options: {
        responsive: true,
        cutout: '50%',
        legend: { position: 'bottom' },
      },
    };
  }

  /**
   * Helper methods
   */
  private async getActiveThreatSources(): Promise<ThreatSource[]> {
    const sources = threatDetection.getSuspiciousIPs();
    return sources.map(ip => ({
      ipAddress: ip.ipAddress,
      threatScore: ip.threatScore,
      firstSeen: new Date(ip.firstSeen).toISOString(),
      lastSeen: new Date(ip.lastSeen).toISOString(),
      eventCount: ip.failedAttempts.length,
      isBlocked: ip.blocked,
    }));
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    return {
      status: 'operational',
      uptime: '99.9%',
      responseTime: 150,
      errorRate: 0.1,
      lastCheck: new Date().toISOString(),
    };
  }

  private async getActiveAlerts(): Promise<SecurityAlert[]> {
    // This would fetch from database
    return [];
  }

  private async getTrendData(): Promise<TrendData> {
    // This would calculate trends from historical data
    return {
      authentication: {
        successful: {},
        failed: {},
      },
    };
  }

  private groupEventsByTimeInterval(events: SecurityEvent[], interval: 'hour' | 'day'): any {
    const groups: any = { low: {}, medium: {}, high: {}, critical: {} };
    
    events.forEach(event => {
      const date = new Date(event.timestamp);
      const key = interval === 'hour' ? date.getHours() : date.getDate();
      const severity = event.severity;
      
      if (!groups[severity][key]) {
        groups[severity][key] = 0;
      }
      groups[severity][key]++;
    });
    
    return groups;
  }

  private groupEventsByLocation(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const country = event.geolocation?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEventsByDevice(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const device = this.extractDeviceType(event.userAgent);
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopEndpoints(events: SecurityEvent[]): Array<{ endpoint: string; count: number }> {
    const endpointCounts = events.reduce((acc, event) => {
      const endpoint = event.metadata?.endpoint || 'unknown';
      acc[endpoint] = (acc[endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private identifyRiskFactors(metrics: SecurityMetrics, events: SecurityEvent[]): string[] {
    const factors: string[] = [];
    
    if (metrics.authenticationMetrics.successRate < 80) {
      factors.push('Low authentication success rate');
    }
    
    if (metrics.eventsBySeverity.critical > 0) {
      factors.push('Critical security events detected');
    }
    
    if (metrics.rateLimitingMetrics.totalBlocked > 100) {
      factors.push('High rate limiting activity');
    }
    
    return factors;
  }

  private generateRecommendations(metrics: SecurityMetrics, events: SecurityEvent[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.authenticationMetrics.failedLogins > 100) {
      recommendations.push('Consider implementing stricter authentication policies');
    }
    
    if (metrics.csrfMetrics.attacks > 0) {
      recommendations.push('Review CSRF protection implementation');
    }
    
    if (metrics.anomalyDetection.detected > 20) {
      recommendations.push('Investigate anomaly detection patterns');
    }
    
    return recommendations;
  }

  private calculateSecurityStatus(metrics: SecurityMetrics, events: SecurityEvent[]): 'secure' | 'warning' | 'alert' | 'critical' {
    if (metrics.eventsBySeverity.critical > 0) return 'critical';
    if (metrics.eventsBySeverity.high > 5) return 'alert';
    if (metrics.authenticationMetrics.successRate < 90) return 'warning';
    return 'secure';
  }

  private calculateRiskLevel(metrics: SecurityMetrics, events: SecurityEvent[]): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    riskScore += metrics.eventsBySeverity.critical * 10;
    riskScore += metrics.eventsBySeverity.high * 5;
    riskScore += metrics.eventsBySeverity.medium * 2;
    riskScore += metrics.eventsBySeverity.low * 1;
    
    if (riskScore > 100) return 'critical';
    if (riskScore > 50) return 'high';
    if (riskScore > 20) return 'medium';
    return 'low';
  }

  private findPeakActivity(timeGroups: any): { hour: number; count: number } {
    let maxHour = 0;
    let maxCount = 0;
    
    for (let hour = 0; hour < 24; hour++) {
      const count = Object.values(timeGroups).reduce((sum: number, severity: any) => 
        sum + (severity[hour] || 0), 0);
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    }
    
    return { hour: maxHour, count: maxCount };
  }

  private calculateTrend(timeGroups: any): 'increasing' | 'decreasing' | 'stable' {
    // Simple trend calculation - compare first and last quarters
    const firstQuarter = this.sumQuarter(timeGroups, 0, 6);
    const lastQuarter = this.sumQuarter(timeGroups, 18, 24);
    
    const diff = lastQuarter - firstQuarter;
    if (Math.abs(diff) < firstQuarter * 0.1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  private sumQuarter(timeGroups: any, start: number, end: number): number {
    let sum = 0;
    for (let hour = start; hour < end; hour++) {
      sum += Object.values(timeGroups).reduce((hourSum: number, severity: any) => 
        hourSum + (severity[hour] || 0), 0);
    }
    return sum;
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getStatusFromValue(
    value: number, 
    warningThreshold: number, 
    criticalThreshold: number,
    higherIsBetter: boolean = false
  ): 'good' | 'warning' | 'critical' {
    if (higherIsBetter) {
      if (value >= warningThreshold) return 'good';
      if (value >= criticalThreshold) return 'warning';
      return 'critical';
    } else {
      if (value <= warningThreshold) return 'good';
      if (value <= criticalThreshold) return 'warning';
      return 'critical';
    }
  }

  private formatEventTypeName(eventType: string): string {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getEventTypeColor(eventType: SecurityEventType): string {
    const colors: Record<string, string> = {
      auth: '#3B82F6',
      session: '#10B981',
      csrf: '#F59E0B',
      rate: '#EF4444',
      admin: '#8B5CF6',
      threat: '#DC2626',
    };
    
    const category = eventType.split('_')[0];
    return colors[category] || '#6B7280';
  }

  private getThreatScoreColor(score: number): string {
    if (score >= 80) return '#7C2D12';
    if (score >= 60) return '#EF4444';
    if (score >= 30) return '#F59E0B';
    return '#10B981';
  }

  private getRandomColor(): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.***`;
    }
    return ip.substring(0, 8) + '...';
  }

  private extractDeviceType(userAgent: string): string {
    if (/mobile|android|iphone/i.test(userAgent)) return 'Mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
    if (/bot|crawler|spider/i.test(userAgent)) return 'Bot';
    return 'Desktop';
  }

  private notifySubscribers(event: string, data: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Error notifying dashboard subscriber:', error);
      }
    });
  }

  private getDefaultConfig(): SecurityDashboardConfig {
    return {
      refreshInterval: 30000, // 30 seconds
      alertThresholds: {
        criticalEvents: 1,
        highThreatScore: 80,
        failedLoginsPerHour: 50,
        rateLimitViolationsPerHour: 100,
      },
      widgets: [],
      notifications: {
        email: true,
        slack: true,
        realtime: true,
      },
    };
  }

  /**
   * Public configuration methods
   */
  public updateConfig(config: Partial<SecurityDashboardConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.refreshInterval && this.refreshInterval) {
      this.stopRealTimeUpdates();
      this.startRealTimeUpdates();
    }
  }

  public getConfig(): SecurityDashboardConfig {
    return { ...this.config };
  }
}

// Type definitions
interface DashboardData {
  timestamp: string;
  overview: DashboardOverview;
  metrics: SecurityMetrics;
  recentEvents: SecurityEvent[];
  threatSources: ThreatSource[];
  systemHealth: SystemHealth;
  alerts: SecurityAlert[];
  charts: ChartData;
  widgets: WidgetData[];
  summary: DashboardSummary;
}

interface DashboardOverview {
  securityStatus: 'secure' | 'warning' | 'alert' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threatsBlocked: number;
  activeIncidents: number;
  pendingActions: number;
  systemHealth: 'operational' | 'degraded' | 'offline';
  lastUpdated: string;
}

interface ChartData {
  eventsByType: ChartConfig;
  eventsBySeverity: ChartConfig;
  threatScoreDistribution: ChartConfig;
  timelineChart: ChartConfig;
  geoLocationChart: ChartConfig;
  topThreatSources: ChartConfig;
  authenticationTrends: ChartConfig;
  rateLimitingChart: ChartConfig;
  csrfChart: ChartConfig;
  anomalyChart: ChartConfig;
}

interface ChartConfig {
  type: 'pie' | 'doughnut' | 'bar' | 'horizontalBar' | 'line' | 'worldMap';
  title: string;
  data: any;
  options: any;
}

interface WidgetData {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'table';
  title: string;
  value: number | string;
  change?: number;
  status: 'good' | 'warning' | 'critical';
  icon: string;
  suffix?: string;
}

interface DashboardSummary {
  eventTrends: {
    hourly: any;
    peak: { hour: number; count: number };
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  geographicDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  riskFactors: string[];
  recommendations: string[];
}

interface ThreatSource {
  ipAddress: string;
  threatScore: number;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  isBlocked: boolean;
}

interface SystemHealth {
  status: 'operational' | 'degraded' | 'offline';
  uptime: string;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: SecurityEventSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface TrendData {
  authentication: {
    successful: Record<number, number>;
    failed: Record<number, number>;
  };
}

// Export singleton instance
export const securityDashboard = SecurityDashboard.getInstance();

// Convenience functions
export const getDashboardData = securityDashboard.getDashboardData.bind(securityDashboard);
export const generateChartData = securityDashboard.generateChartData.bind(securityDashboard);
export const startRealTimeUpdates = securityDashboard.startRealTimeUpdates.bind(securityDashboard);
export const stopRealTimeUpdates = securityDashboard.stopRealTimeUpdates.bind(securityDashboard);