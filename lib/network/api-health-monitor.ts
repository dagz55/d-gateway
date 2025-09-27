/**
 * API Health Monitor - Monitors API endpoint health and performance
 *
 * This monitor provides:
 * - API endpoint health checking
 * - Performance monitoring and latency tracking
 * - Circuit breaker pattern implementation
 * - Automatic retry mechanisms
 * - Rate limiting awareness
 * - Historical performance tracking
 */

import type { NetworkIssue } from './network-agent';

export interface ApiEndpointStatus {
  status: 'healthy' | 'slow' | 'error' | 'offline';
  latency: number;
  lastCheck: string;
  uptime: number;
}

export interface ApiEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  expectedStatus: number[];
  timeout: number;
  retryCount: number;
  circuitBreaker: {
    failureThreshold: number;
    resetTimeout: number;
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailure?: string;
    nextRetry?: string;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
    lastSuccess?: string;
    lastFailure?: string;
  };
  status: ApiEndpointStatus;
}

export interface ApiHealthMetrics {
  totalEndpoints: number;
  healthyEndpoints: number;
  slowEndpoints: number;
  errorEndpoints: number;
  offlineEndpoints: number;
  averageLatency: number;
  totalRequests: number;
  successRate: number;
  circuitBreakersOpen: number;
}

export class ApiHealthMonitor {
  private endpoints = new Map<string, ApiEndpoint>();
  private statusListeners: ((status: Record<string, ApiEndpointStatus>) => void)[] = [];
  private issueListeners: ((issue: NetworkIssue) => void)[] = [];

  private monitoringInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor() {
    this.initializeEndpoints();
  }

  /**
   * Start API health monitoring
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('API Health Monitor is already running');
      return;
    }

    console.log('Starting API Health Monitor...');
    this.isRunning = true;

    try {
      // Perform initial health checks
      await this.checkAllEndpoints();

      // Start periodic monitoring
      this.startPeriodicMonitoring();

      console.log('API Health Monitor started successfully');
    } catch (error) {
      console.error('Failed to start API Health Monitor:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop API health monitoring
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping API Health Monitor...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('API Health Monitor stopped');
  }

  /**
   * Get current API status for all endpoints
   */
  public async getStatus(): Promise<Record<string, ApiEndpointStatus>> {
    const status: Record<string, ApiEndpointStatus> = {};

    for (const [id, endpoint] of this.endpoints) {
      status[id] = { ...endpoint.status };
    }

    return status;
  }

  /**
   * Get comprehensive metrics
   */
  public getMetrics(): ApiHealthMetrics {
    const endpoints = Array.from(this.endpoints.values());

    const metrics: ApiHealthMetrics = {
      totalEndpoints: endpoints.length,
      healthyEndpoints: endpoints.filter(e => e.status.status === 'healthy').length,
      slowEndpoints: endpoints.filter(e => e.status.status === 'slow').length,
      errorEndpoints: endpoints.filter(e => e.status.status === 'error').length,
      offlineEndpoints: endpoints.filter(e => e.status.status === 'offline').length,
      averageLatency: 0,
      totalRequests: 0,
      successRate: 0,
      circuitBreakersOpen: endpoints.filter(e => e.circuitBreaker.state === 'open').length
    };

    // Calculate aggregate metrics
    if (endpoints.length > 0) {
      const totalLatency = endpoints.reduce((sum, e) => sum + e.metrics.averageLatency, 0);
      metrics.averageLatency = totalLatency / endpoints.length;

      const totalRequests = endpoints.reduce((sum, e) => sum + e.metrics.totalRequests, 0);
      const totalSuccessful = endpoints.reduce((sum, e) => sum + e.metrics.successfulRequests, 0);

      metrics.totalRequests = totalRequests;
      metrics.successRate = totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0;
    }

    return metrics;
  }

  /**
   * Get endpoint details
   */
  public getEndpoints(): ApiEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Check specific endpoint health
   */
  public async checkEndpoint(endpointId: string): Promise<boolean> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      console.error(`Endpoint ${endpointId} not found`);
      return false;
    }

    return await this.performHealthCheck(endpoint);
  }

  /**
   * Add new endpoint to monitor
   */
  public addEndpoint(config: {
    id: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    expectedStatus?: number[];
    timeout?: number;
    retryCount?: number;
    failureThreshold?: number;
  }): void {
    const endpoint: ApiEndpoint = {
      id: config.id,
      url: config.url,
      method: config.method || 'GET',
      expectedStatus: config.expectedStatus || [200],
      timeout: config.timeout || 10000,
      retryCount: config.retryCount || 3,
      circuitBreaker: {
        failureThreshold: config.failureThreshold || 5,
        resetTimeout: 60000, // 1 minute
        state: 'closed',
        failures: 0
      },
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        minLatency: Infinity,
        maxLatency: 0
      },
      status: {
        status: 'offline',
        latency: 0,
        lastCheck: new Date().toISOString(),
        uptime: 0
      }
    };

    this.endpoints.set(config.id, endpoint);
    console.log(`Added endpoint ${config.id} to monitoring`);
  }

  /**
   * Remove endpoint from monitoring
   */
  public removeEndpoint(endpointId: string): boolean {
    const removed = this.endpoints.delete(endpointId);
    if (removed) {
      console.log(`Removed endpoint ${endpointId} from monitoring`);
    }
    return removed;
  }

  /**
   * Add status change listener
   */
  public onStatusChange(callback: (status: Record<string, ApiEndpointStatus>) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add issue listener
   */
  public onIssue(callback: (issue: NetworkIssue) => void): () => void {
    this.issueListeners.push(callback);
    return () => {
      const index = this.issueListeners.indexOf(callback);
      if (index > -1) {
        this.issueListeners.splice(index, 1);
      }
    };
  }

  private initializeEndpoints(): void {
    // Initialize core application endpoints
    const coreEndpoints = [
      {
        id: 'admin-health',
        url: '/api/admin/health',
        method: 'HEAD' as const,
        expectedStatus: [200, 401, 403],
        timeout: 5000
      },
      {
        id: 'crypto-prices',
        url: '/api/crypto/prices',
        method: 'GET' as const,
        expectedStatus: [200],
        timeout: 8000
      },
      {
        id: 'bitcoin-chart',
        url: '/api/crypto/bitcoin-chart',
        method: 'GET' as const,
        expectedStatus: [200],
        timeout: 10000
      },
      {
        id: 'dashboard-stats',
        url: '/api/dashboard/stats',
        method: 'GET' as const,
        expectedStatus: [200, 401],
        timeout: 5000
      },
      {
        id: 'trades',
        url: '/api/trades',
        method: 'GET' as const,
        expectedStatus: [200, 401],
        timeout: 5000
      },
      {
        id: 'signals',
        url: '/api/signals',
        method: 'GET' as const,
        expectedStatus: [200, 401],
        timeout: 5000
      },
      {
        id: 'news',
        url: '/api/news',
        method: 'GET' as const,
        expectedStatus: [200],
        timeout: 8000
      },
      {
        id: 'deposits',
        url: '/api/deposits',
        method: 'GET' as const,
        expectedStatus: [200, 401],
        timeout: 5000
      },
      {
        id: 'withdrawals',
        url: '/api/withdrawals',
        method: 'GET' as const,
        expectedStatus: [200, 401],
        timeout: 5000
      }
    ];

    for (const config of coreEndpoints) {
      this.addEndpoint(config);
    }
  }

  private startPeriodicMonitoring(): void {
    // Check all endpoints every 2 minutes
    this.monitoringInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkAllEndpoints();
      }
    }, 120000);
  }

  private async checkAllEndpoints(): Promise<void> {
    console.log('Performing health checks on all endpoints...');

    const checkPromises = Array.from(this.endpoints.values()).map(endpoint =>
      this.performHealthCheck(endpoint).catch(error => {
        console.error(`Health check failed for ${endpoint.id}:`, error);
        return false;
      })
    );

    await Promise.allSettled(checkPromises);

    // Notify listeners of status change
    this.notifyStatusListeners();
  }

  private async performHealthCheck(endpoint: ApiEndpoint): Promise<boolean> {
    // Check circuit breaker state
    if (endpoint.circuitBreaker.state === 'open') {
      if (endpoint.circuitBreaker.nextRetry && new Date() < new Date(endpoint.circuitBreaker.nextRetry)) {
        // Circuit breaker is still open
        return false;
      } else {
        // Try to close circuit breaker
        endpoint.circuitBreaker.state = 'half-open';
      }
    }

    const startTime = Date.now();
    let success = false;
    let latency = 0;
    let statusCode = 0;

    try {
      // Build request options
      const requestOptions: RequestInit = {
        method: endpoint.method,
        signal: AbortSignal.timeout(endpoint.timeout),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NetworkAgent/1.0'
        }
      };

      // For authenticated endpoints, we might need to include tokens
      // This is simplified - in production, you'd handle authentication properly
      if (endpoint.url.includes('/admin/') || endpoint.url.includes('/dashboard/')) {
        // Skip auth headers for health checks to avoid 401s in monitoring
      }

      const response = await fetch(endpoint.url, requestOptions);
      statusCode = response.status;
      latency = Date.now() - startTime;

      // Check if status code is expected
      success = endpoint.expectedStatus.includes(statusCode);

      // Update endpoint status
      this.updateEndpointStatus(endpoint, success, latency, statusCode);

    } catch (error: any) {
      latency = Date.now() - startTime;
      console.warn(`Health check failed for ${endpoint.id}:`, error.message);

      // Handle different error types
      if (error.name === 'AbortError') {
        statusCode = 408; // Request Timeout
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        statusCode = 503; // Service Unavailable
      } else {
        statusCode = 500; // Internal Server Error
      }

      this.updateEndpointStatus(endpoint, false, latency, statusCode, error.message);
    }

    // Update circuit breaker
    this.updateCircuitBreaker(endpoint, success);

    // Update metrics
    this.updateEndpointMetrics(endpoint, success, latency);

    return success;
  }

  private updateEndpointStatus(
    endpoint: ApiEndpoint,
    success: boolean,
    latency: number,
    statusCode: number,
    errorMessage?: string
  ): void {
    const now = new Date().toISOString();

    if (success) {
      // Determine status based on latency
      let status: 'healthy' | 'slow';
      if (latency < 1000) {
        status = 'healthy';
      } else {
        status = 'slow';
      }

      endpoint.status = {
        status,
        latency,
        lastCheck: now,
        uptime: endpoint.status.uptime + 1
      };

      endpoint.metrics.lastSuccess = now;

    } else {
      let status: 'error' | 'offline';
      if (statusCode >= 500 || statusCode === 503) {
        status = 'offline';
      } else {
        status = 'error';
      }

      endpoint.status = {
        status,
        latency,
        lastCheck: now,
        uptime: endpoint.status.uptime
      };

      endpoint.metrics.lastFailure = now;

      // Report issue
      this.reportEndpointIssue(endpoint, statusCode, errorMessage);
    }
  }

  private updateCircuitBreaker(endpoint: ApiEndpoint, success: boolean): void {
    const cb = endpoint.circuitBreaker;

    if (success) {
      if (cb.state === 'half-open') {
        // Success in half-open state - close circuit breaker
        cb.state = 'closed';
        cb.failures = 0;
        delete cb.lastFailure;
        delete cb.nextRetry;
        console.log(`Circuit breaker closed for ${endpoint.id}`);
      }
    } else {
      cb.failures++;
      cb.lastFailure = new Date().toISOString();

      if (cb.state === 'closed' && cb.failures >= cb.failureThreshold) {
        // Open circuit breaker
        cb.state = 'open';
        cb.nextRetry = new Date(Date.now() + cb.resetTimeout).toISOString();
        console.warn(`Circuit breaker opened for ${endpoint.id} after ${cb.failures} failures`);

        this.reportIssue({
          id: `circuit-breaker-${endpoint.id}-${Date.now()}`,
          severity: 'high',
          type: 'api',
          title: 'Circuit Breaker Opened',
          description: `Circuit breaker opened for endpoint ${endpoint.id} due to repeated failures`,
          detectedAt: new Date().toISOString()
        });
      } else if (cb.state === 'half-open') {
        // Failed in half-open state - back to open
        cb.state = 'open';
        cb.nextRetry = new Date(Date.now() + cb.resetTimeout).toISOString();
        console.warn(`Circuit breaker reopened for ${endpoint.id}`);
      }
    }
  }

  private updateEndpointMetrics(endpoint: ApiEndpoint, success: boolean, latency: number): void {
    const metrics = endpoint.metrics;

    metrics.totalRequests++;

    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update latency metrics
    if (latency > 0) {
      metrics.minLatency = Math.min(metrics.minLatency, latency);
      metrics.maxLatency = Math.max(metrics.maxLatency, latency);

      // Update average latency (rolling average)
      const totalLatency = metrics.averageLatency * (metrics.totalRequests - 1) + latency;
      metrics.averageLatency = totalLatency / metrics.totalRequests;
    }
  }

  private reportEndpointIssue(endpoint: ApiEndpoint, statusCode: number, errorMessage?: string): void {
    let severity: 'low' | 'medium' | 'high' | 'critical';
    let title: string;
    let description: string;

    if (statusCode >= 500) {
      severity = 'high';
      title = 'API Server Error';
      description = `Endpoint ${endpoint.url} returned ${statusCode} status code`;
    } else if (statusCode === 404) {
      severity = 'medium';
      title = 'API Endpoint Not Found';
      description = `Endpoint ${endpoint.url} not found (404)`;
    } else if (statusCode === 408 || statusCode === 0) {
      severity = 'medium';
      title = 'API Request Timeout';
      description = `Endpoint ${endpoint.url} timed out after ${endpoint.timeout}ms`;
    } else {
      severity = 'low';
      title = 'API Request Failed';
      description = `Endpoint ${endpoint.url} failed with status ${statusCode}`;
    }

    if (errorMessage) {
      description += `: ${errorMessage}`;
    }

    this.reportIssue({
      id: `api-${endpoint.id}-${Date.now()}`,
      severity,
      type: 'api',
      title,
      description,
      detectedAt: new Date().toISOString()
    });
  }

  private reportIssue(issue: NetworkIssue): void {
    this.issueListeners.forEach(listener => {
      try {
        listener(issue);
      } catch (error) {
        console.error('Error in API issue listener:', error);
      }
    });
  }

  private async notifyStatusListeners(): Promise<void> {
    const status = await this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in API status listener:', error);
      }
    });
  }
}