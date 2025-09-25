/**
 * Network Agent - Main network monitoring and diagnostic system
 *
 * This agent provides comprehensive network monitoring capabilities including:
 * - WebSocket connection monitoring
 * - API endpoint health checks
 * - Connection diagnostics
 * - Automated retry mechanisms
 * - Real-time status reporting
 * - Network anomaly detection
 */

import { WebSocketMonitor } from './websocket-monitor';
import { ApiHealthMonitor } from './api-health-monitor';
import { ConnectionDiagnostics } from './connection-diagnostics';

export interface NetworkStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'offline';
  websockets: {
    supabase: 'connected' | 'connecting' | 'disconnected' | 'error';
    trading: 'connected' | 'connecting' | 'disconnected' | 'error';
  };
  apis: {
    [endpoint: string]: {
      status: 'healthy' | 'slow' | 'error' | 'offline';
      latency: number;
      lastCheck: string;
      uptime: number;
    };
  };
  diagnostics: {
    connectivity: boolean;
    dns: boolean;
    latency: number;
    bandwidth: number;
  };
  timestamp: string;
}

export interface NetworkHealthReport {
  status: NetworkStatus;
  issues: NetworkIssue[];
  recommendations: string[];
  metrics: NetworkMetrics;
}

export interface NetworkIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'websocket' | 'api' | 'connectivity' | 'performance';
  title: string;
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  autoHealed?: boolean;
}

export interface NetworkMetrics {
  uptime: {
    websockets: number;
    apis: number;
    overall: number;
  };
  performance: {
    averageLatency: number;
    maxLatency: number;
    minLatency: number;
    errorRate: number;
  };
  connections: {
    totalConnections: number;
    activeConnections: number;
    failedConnections: number;
    reconnections: number;
  };
  bandwidth: {
    upload: number;
    download: number;
    total: number;
  };
}

export class NetworkAgent {
  private static instance: NetworkAgent | null = null;
  private websocketMonitor: WebSocketMonitor;
  private apiHealthMonitor: ApiHealthMonitor;
  private connectionDiagnostics: ConnectionDiagnostics;

  private isRunning = false;
  private monitoringInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private diagnosticsInterval?: NodeJS.Timeout;

  private currentStatus: NetworkStatus;
  private issues: NetworkIssue[] = [];
  private metrics: NetworkMetrics;
  private startTime = Date.now();

  private listeners: ((status: NetworkStatus) => void)[] = [];
  private issueListeners: ((issue: NetworkIssue) => void)[] = [];

  private constructor() {
    this.websocketMonitor = new WebSocketMonitor();
    this.apiHealthMonitor = new ApiHealthMonitor();
    this.connectionDiagnostics = new ConnectionDiagnostics();

    this.currentStatus = this.initializeStatus();
    this.metrics = this.initializeMetrics();

    this.setupEventListeners();
  }

  public static getInstance(): NetworkAgent {
    if (!NetworkAgent.instance) {
      NetworkAgent.instance = new NetworkAgent();
    }
    return NetworkAgent.instance;
  }

  /**
   * Start the network monitoring agent
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Network agent is already running');
      return;
    }

    console.log('Starting Network Agent...');
    this.isRunning = true;
    this.startTime = Date.now();

    try {
      // Start all monitoring systems
      await this.websocketMonitor.start();
      await this.apiHealthMonitor.start();
      await this.connectionDiagnostics.initialize();

      // Start periodic monitoring
      this.startPeriodicMonitoring();

      console.log('Network Agent started successfully');
      this.logEvent('info', 'Network Agent started');

    } catch (error) {
      console.error('Failed to start Network Agent:', error);
      this.logEvent('error', `Failed to start Network Agent: ${error}`);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the network monitoring agent
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Network Agent...');
    this.isRunning = false;

    // Clear all intervals
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.diagnosticsInterval) clearInterval(this.diagnosticsInterval);

    // Stop all monitoring systems
    await this.websocketMonitor.stop();
    await this.apiHealthMonitor.stop();

    console.log('Network Agent stopped');
    this.logEvent('info', 'Network Agent stopped');
  }

  /**
   * Get current network status
   */
  public getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Get comprehensive health report
   */
  public getHealthReport(): NetworkHealthReport {
    const activeIssues = this.issues.filter(issue => !issue.resolvedAt);
    const recommendations = this.generateRecommendations(activeIssues);

    return {
      status: this.currentStatus,
      issues: activeIssues,
      recommendations,
      metrics: { ...this.metrics }
    };
  }

  /**
   * Force a connectivity check
   */
  public async runDiagnostics(): Promise<NetworkStatus> {
    console.log('Running manual network diagnostics...');

    try {
      // Update all monitoring systems
      await Promise.all([
        this.updateWebSocketStatus(),
        this.updateApiStatus(),
        this.updateDiagnosticsStatus()
      ]);

      this.updateOverallStatus();
      this.notifyListeners();

      return this.currentStatus;
    } catch (error) {
      console.error('Error running diagnostics:', error);
      throw error;
    }
  }

  /**
   * Add status change listener
   */
  public onStatusChange(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Add issue listener
   */
  public onIssueDetected(callback: (issue: NetworkIssue) => void): () => void {
    this.issueListeners.push(callback);
    return () => {
      const index = this.issueListeners.indexOf(callback);
      if (index > -1) {
        this.issueListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get metrics for reporting
   */
  public getMetrics(): NetworkMetrics {
    return { ...this.metrics };
  }

  private initializeStatus(): NetworkStatus {
    return {
      overall: 'offline',
      websockets: {
        supabase: 'disconnected',
        trading: 'disconnected'
      },
      apis: {},
      diagnostics: {
        connectivity: false,
        dns: false,
        latency: 0,
        bandwidth: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  private initializeMetrics(): NetworkMetrics {
    return {
      uptime: {
        websockets: 0,
        apis: 0,
        overall: 0
      },
      performance: {
        averageLatency: 0,
        maxLatency: 0,
        minLatency: 0,
        errorRate: 0
      },
      connections: {
        totalConnections: 0,
        activeConnections: 0,
        failedConnections: 0,
        reconnections: 0
      },
      bandwidth: {
        upload: 0,
        download: 0,
        total: 0
      }
    };
  }

  private setupEventListeners(): void {
    // WebSocket event listeners
    this.websocketMonitor.onStatusChange((status) => {
      this.currentStatus.websockets = status;
      this.updateOverallStatus();
      this.notifyListeners();
    });

    this.websocketMonitor.onIssue((issue) => {
      this.reportIssue(issue);
    });

    // API health event listeners
    this.apiHealthMonitor.onStatusChange((status) => {
      this.currentStatus.apis = status;
      this.updateOverallStatus();
      this.notifyListeners();
    });

    this.apiHealthMonitor.onIssue((issue) => {
      this.reportIssue(issue);
    });
  }

  private startPeriodicMonitoring(): void {
    // Main monitoring loop - every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.updateWebSocketStatus();
        await this.updateApiStatus();
        this.updateMetrics();
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    }, 30000);

    // Health check loop - every 2 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Error in health check loop:', error);
      }
    }, 120000);

    // Diagnostics loop - every 5 minutes
    this.diagnosticsInterval = setInterval(async () => {
      try {
        await this.updateDiagnosticsStatus();
      } catch (error) {
        console.error('Error in diagnostics loop:', error);
      }
    }, 300000);
  }

  private async updateWebSocketStatus(): Promise<void> {
    const status = await this.websocketMonitor.getStatus();
    this.currentStatus.websockets = status;
  }

  private async updateApiStatus(): Promise<void> {
    const status = await this.apiHealthMonitor.getStatus();
    this.currentStatus.apis = status;
  }

  private async updateDiagnosticsStatus(): Promise<void> {
    const diagnostics = await this.connectionDiagnostics.runDiagnostics();
    this.currentStatus.diagnostics = diagnostics;
  }

  private updateOverallStatus(): void {
    const wsHealthy = Object.values(this.currentStatus.websockets).some(status => status === 'connected');
    const apiHealthy = Object.values(this.currentStatus.apis).some(api => api.status === 'healthy');
    const diagnosticsHealthy = this.currentStatus.diagnostics.connectivity;

    if (!diagnosticsHealthy) {
      this.currentStatus.overall = 'offline';
    } else if (!wsHealthy && !apiHealthy) {
      this.currentStatus.overall = 'critical';
    } else if (wsHealthy && apiHealthy) {
      this.currentStatus.overall = 'healthy';
    } else {
      this.currentStatus.overall = 'degraded';
    }

    this.currentStatus.timestamp = new Date().toISOString();
  }

  private async performHealthCheck(): Promise<void> {
    console.log('Performing network health check...');

    // Auto-heal disconnected WebSocket connections
    const wsStatus = this.currentStatus.websockets;
    if (wsStatus.supabase === 'disconnected' || wsStatus.supabase === 'error') {
      try {
        await this.websocketMonitor.reconnectSupabase();
        this.logEvent('info', 'Auto-healed Supabase WebSocket connection');
      } catch (error) {
        console.error('Failed to auto-heal Supabase WebSocket:', error);
      }
    }

    // Check for stale API connections
    for (const [endpoint, status] of Object.entries(this.currentStatus.apis)) {
      const lastCheckAge = Date.now() - new Date(status.lastCheck).getTime();
      if (lastCheckAge > 300000) { // 5 minutes
        this.apiHealthMonitor.checkEndpoint(endpoint);
      }
    }
  }

  private updateMetrics(): void {
    const uptime = Date.now() - this.startTime;

    // Update uptime metrics
    this.metrics.uptime.overall = uptime / 1000; // Convert to seconds

    // Calculate WebSocket uptime
    const wsConnected = Object.values(this.currentStatus.websockets).filter(s => s === 'connected').length;
    const wsTotal = Object.keys(this.currentStatus.websockets).length;
    this.metrics.uptime.websockets = wsTotal > 0 ? (wsConnected / wsTotal) * 100 : 0;

    // Calculate API uptime
    const apiHealthy = Object.values(this.currentStatus.apis).filter(api => api.status === 'healthy').length;
    const apiTotal = Object.keys(this.currentStatus.apis).length;
    this.metrics.uptime.apis = apiTotal > 0 ? (apiHealthy / apiTotal) * 100 : 0;

    // Update performance metrics
    const latencies = Object.values(this.currentStatus.apis).map(api => api.latency).filter(l => l > 0);
    if (latencies.length > 0) {
      this.metrics.performance.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      this.metrics.performance.maxLatency = Math.max(...latencies);
      this.metrics.performance.minLatency = Math.min(...latencies);
    }

    // Calculate error rate
    const totalChecks = Object.values(this.currentStatus.apis).length;
    const errorCount = Object.values(this.currentStatus.apis).filter(api => api.status === 'error').length;
    this.metrics.performance.errorRate = totalChecks > 0 ? (errorCount / totalChecks) * 100 : 0;
  }

  private reportIssue(issue: NetworkIssue): void {
    // Check if this issue already exists
    const existingIssue = this.issues.find(i =>
      i.type === issue.type &&
      i.title === issue.title &&
      !i.resolvedAt
    );

    if (existingIssue) {
      return; // Don't duplicate issues
    }

    this.issues.push(issue);
    this.logEvent('warn', `Network issue detected: ${issue.title}`);

    // Notify issue listeners
    this.issueListeners.forEach(listener => {
      try {
        listener(issue);
      } catch (error) {
        console.error('Error in issue listener:', error);
      }
    });

    // Auto-heal if possible
    this.attemptAutoHeal(issue);
  }

  private async attemptAutoHeal(issue: NetworkIssue): Promise<void> {
    let healed = false;

    try {
      switch (issue.type) {
        case 'websocket':
          if (issue.title.includes('Supabase')) {
            await this.websocketMonitor.reconnectSupabase();
            healed = true;
          }
          break;

        case 'api': {
          // Retry failed API endpoints
          const endpoint = this.extractEndpointFromIssue(issue);
          if (endpoint) {
            await this.apiHealthMonitor.checkEndpoint(endpoint);
            healed = true;
          }
          break;
        }

        case 'connectivity':
          // Run diagnostics to refresh connectivity status
          await this.connectionDiagnostics.runDiagnostics();
          healed = true;
          break;
      }

      if (healed) {
        issue.autoHealed = true;
        issue.resolvedAt = new Date().toISOString();
        this.logEvent('info', `Auto-healed issue: ${issue.title}`);
      }
    } catch (error) {
      console.error('Auto-heal attempt failed:', error);
    }
  }

  private extractEndpointFromIssue(issue: NetworkIssue): string | null {
    // Extract endpoint from issue description or title
    const match = issue.description.match(/endpoint[:\s]+([^\s]+)/i);
    return match ? match[1] : null;
  }

  private generateRecommendations(issues: NetworkIssue[]): string[] {
    const recommendations: string[] = [];

    const issueTypes = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // WebSocket recommendations
    if (issueTypes.websocket > 0) {
      recommendations.push('Check WebSocket connections and consider implementing exponential backoff');
      recommendations.push('Verify Supabase configuration and API keys');
    }

    // API recommendations
    if (issueTypes.api > 2) {
      recommendations.push('Multiple API endpoints are failing - check network connectivity');
      recommendations.push('Consider implementing circuit breaker pattern for API calls');
    }

    // Connectivity recommendations
    if (issueTypes.connectivity > 0) {
      recommendations.push('Network connectivity issues detected - check internet connection');
      recommendations.push('Consider implementing offline mode for critical features');
    }

    // Performance recommendations
    if (this.metrics.performance.averageLatency > 2000) {
      recommendations.push('High latency detected - optimize API calls or consider CDN');
    }

    if (this.metrics.performance.errorRate > 10) {
      recommendations.push('High error rate detected - implement better error handling and retries');
    }

    return recommendations;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  private logEvent(level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[NetworkAgent ${timestamp}] ${message}`;

    switch (level) {
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }
}

// Export singleton instance
export const networkAgent = NetworkAgent.getInstance();

// Auto-start in browser environment
if (typeof window !== 'undefined') {
  // Start with a delay to allow for proper initialization
  setTimeout(() => {
    networkAgent.start().catch(error => {
      console.error('Failed to auto-start network agent:', error);
    });
  }, 1000);
}