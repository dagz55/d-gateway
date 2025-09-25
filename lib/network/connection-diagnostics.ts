/**
 * Connection Diagnostics - Network connectivity and performance diagnostics
 *
 * This utility provides:
 * - Basic connectivity testing
 * - DNS resolution testing
 * - Latency measurement
 * - Bandwidth estimation
 * - Network path analysis
 * - Browser capability detection
 * - Performance recommendations
 */

export interface ConnectivityResult {
  connectivity: boolean;
  dns: boolean;
  latency: number;
  bandwidth: number;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: any;
  error?: string;
  duration: number;
  timestamp: string;
}

export interface NetworkCapabilities {
  onLine: boolean;
  connection?: {
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
    downlink: number;
    downlinkMax: number;
    rtt: number;
    saveData: boolean;
  };
  serviceWorker: boolean;
  localStorage: boolean;
  indexedDB: boolean;
  webSocket: boolean;
  fetch: boolean;
  streams: boolean;
}

export interface PerformanceMetrics {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number; // Time to First Byte
  transfer: number;
  total: number;
}

export interface DiagnosticReport {
  timestamp: string;
  connectivity: ConnectivityResult;
  capabilities: NetworkCapabilities;
  performance: PerformanceMetrics;
  tests: DiagnosticTest[];
  recommendations: string[];
  score: number; // 0-100 network health score
}

export class ConnectionDiagnostics {
  private testResults: DiagnosticTest[] = [];
  private capabilities: NetworkCapabilities;
  private performanceMetrics: PerformanceMetrics;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.performanceMetrics = this.initializePerformanceMetrics();
  }

  /**
   * Initialize diagnostics system
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Connection Diagnostics...');

    try {
      // Detect browser capabilities
      this.capabilities = this.detectCapabilities();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      console.log('Connection Diagnostics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Connection Diagnostics:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive network diagnostics
   */
  public async runDiagnostics(): Promise<ConnectivityResult> {
    console.log('Running network diagnostics...');

    this.testResults = [];

    try {
      // Run diagnostic tests in parallel where possible
      const [
        connectivityResult,
        dnsResult,
        latencyResult,
        bandwidthResult
      ] = await Promise.allSettled([
        this.testConnectivity(),
        this.testDNS(),
        this.measureLatency(),
        this.estimateBandwidth()
      ]);

      // Process results
      const connectivity = this.getSettledValue(connectivityResult, false);
      const dns = this.getSettledValue(dnsResult, false);
      const latency = this.getSettledValue(latencyResult, 0);
      const bandwidth = this.getSettledValue(bandwidthResult, 0);

      const result: ConnectivityResult = {
        connectivity,
        dns,
        latency,
        bandwidth
      };

      console.log('Network diagnostics completed:', result);
      return result;

    } catch (error) {
      console.error('Error running network diagnostics:', error);
      return {
        connectivity: false,
        dns: false,
        latency: 0,
        bandwidth: 0
      };
    }
  }

  /**
   * Generate comprehensive diagnostic report
   */
  public async generateReport(): Promise<DiagnosticReport> {
    console.log('Generating diagnostic report...');

    const connectivity = await this.runDiagnostics();
    const recommendations = this.generateRecommendations();
    const score = this.calculateNetworkScore(connectivity);

    return {
      timestamp: new Date().toISOString(),
      connectivity,
      capabilities: this.capabilities,
      performance: this.performanceMetrics,
      tests: [...this.testResults],
      recommendations,
      score
    };
  }

  /**
   * Get current network capabilities
   */
  public getCapabilities(): NetworkCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Test basic internet connectivity
   */
  private async testConnectivity(): Promise<boolean> {
    const test = this.createTest(
      'connectivity',
      'Internet Connectivity Test',
      'Tests basic internet connectivity using multiple methods'
    );

    try {
      // Method 1: Check navigator.onLine (unreliable but fast)
      if (!navigator.onLine) {
        throw new Error('Navigator reports offline');
      }

      // Method 2: Fetch a lightweight resource
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        // Use a reliable, fast endpoint
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // For no-cors requests, we can't check status, but if it doesn't throw, we're connected
        this.completeTest(test, true, 'Connectivity test passed');
        return true;

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error('Connectivity test timed out');
        }
        throw fetchError;
      }

    } catch (error: any) {
      this.completeTest(test, false, `Connectivity test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Test DNS resolution
   */
  private async testDNS(): Promise<boolean> {
    const test = this.createTest(
      'dns',
      'DNS Resolution Test',
      'Tests DNS resolution by resolving multiple domains'
    );

    try {
      // Test DNS by trying to resolve various domains
      const testDomains = [
        'google.com',
        'cloudflare.com',
        'github.com'
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        // Try to fetch from multiple domains (no-cors to avoid CORS issues)
        const promises = testDomains.map(domain =>
          fetch(`https://${domain}/favicon.ico`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          }).catch(() => null) // Don't fail on individual domain failures
        );

        const results = await Promise.all(promises);
        clearTimeout(timeoutId);

        // If at least one request succeeded, DNS is working
        const successCount = results.filter(result => result !== null).length;

        if (successCount > 0) {
          this.completeTest(test, true, `DNS resolution successful (${successCount}/${testDomains.length} domains)`);
          return true;
        } else {
          throw new Error('All DNS resolution attempts failed');
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error('DNS test timed out');
        }
        throw fetchError;
      }

    } catch (error: any) {
      this.completeTest(test, false, `DNS test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Measure network latency
   */
  private async measureLatency(): Promise<number> {
    const test = this.createTest(
      'latency',
      'Latency Measurement',
      'Measures round-trip time to various endpoints'
    );

    try {
      const measurements: number[] = [];

      // Test endpoints for latency measurement
      const endpoints = [
        'https://www.google.com/favicon.ico',
        'https://www.cloudflare.com/favicon.ico'
      ];

      for (const endpoint of endpoints) {
        try {
          const startTime = performance.now();

          await fetch(endpoint, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
          });

          const endTime = performance.now();
          const latency = endTime - startTime;

          if (latency > 0 && latency < 30000) { // Sanity check
            measurements.push(latency);
          }

        } catch (error) {
          console.warn(`Latency test failed for ${endpoint}:`, error);
        }
      }

      if (measurements.length === 0) {
        throw new Error('No successful latency measurements');
      }

      // Calculate average latency
      const averageLatency = measurements.reduce((a, b) => a + b, 0) / measurements.length;

      this.completeTest(test, true, `Average latency: ${averageLatency.toFixed(2)}ms`);
      return Math.round(averageLatency);

    } catch (error: any) {
      this.completeTest(test, false, `Latency test failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Estimate bandwidth
   */
  private async estimateBandwidth(): Promise<number> {
    const test = this.createTest(
      'bandwidth',
      'Bandwidth Estimation',
      'Estimates connection bandwidth using various methods'
    );

    try {
      // Method 1: Use Network Information API if available
      if ('connection' in navigator && (navigator as any).connection) {
        const connection = (navigator as any).connection;
        if (connection.downlink && connection.downlink > 0) {
          const bandwidthMbps = connection.downlink;
          this.completeTest(test, true, `Bandwidth (Network API): ${bandwidthMbps} Mbps`);
          return bandwidthMbps;
        }
      }

      // Method 2: Simple download test
      const testFileUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
      const startTime = performance.now();

      const response = await fetch(testFileUrl, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Download test failed: ${response.status}`);
      }

      const blob = await response.blob();
      const endTime = performance.now();

      const bytes = blob.size;
      const milliseconds = endTime - startTime;
      const megabits = (bytes * 8) / (1024 * 1024);
      const seconds = milliseconds / 1000;
      const mbps = megabits / seconds;

      if (mbps > 0 && mbps < 1000) { // Sanity check
        this.completeTest(test, true, `Estimated bandwidth: ${mbps.toFixed(2)} Mbps`);
        return Math.round(mbps * 10) / 10; // Round to 1 decimal place
      } else {
        throw new Error('Bandwidth calculation resulted in invalid value');
      }

    } catch (error: any) {
      this.completeTest(test, false, `Bandwidth test failed: ${error.message}`);

      // Fallback: Return a conservative estimate based on connection type
      if ('connection' in navigator && (navigator as any).connection) {
        const connection = (navigator as any).connection;
        switch (connection.effectiveType) {
          case 'slow-2g': return 0.25;
          case '2g': return 0.5;
          case '3g': return 1.5;
          case '4g': return 10;
          default: return 1;
        }
      }

      return 0;
    }
  }

  /**
   * Detect browser capabilities
   */
  private detectCapabilities(): NetworkCapabilities {
    const capabilities: NetworkCapabilities = {
      onLine: navigator.onLine,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: this.testLocalStorage(),
      indexedDB: 'indexedDB' in window,
      webSocket: 'WebSocket' in window,
      fetch: 'fetch' in window,
      streams: 'ReadableStream' in window
    };

    // Network Information API
    if ('connection' in navigator && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      capabilities.connection = {
        effectiveType: conn.effectiveType || '4g',
        downlink: conn.downlink || 0,
        downlinkMax: conn.downlinkMax || 0,
        rtt: conn.rtt || 0,
        saveData: conn.saveData || false
      };
    }

    return capabilities;
  }

  /**
   * Test localStorage availability
   */
  private testLocalStorage(): boolean {
    try {
      const testKey = '__network_diagnostics_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Use Navigation Timing API if available
    if ('performance' in window && performance.timing) {
      const timing = performance.timing;

      this.performanceMetrics = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ssl: timing.secureConnectionStart > 0 ?
          timing.connectEnd - timing.secureConnectionStart : 0,
        ttfb: timing.responseStart - timing.requestStart,
        transfer: timing.responseEnd - timing.responseStart,
        total: timing.loadEventEnd - timing.navigationStart
      };
    }

    // Set up Resource Timing observer for ongoing monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.updatePerformanceMetrics(entry as PerformanceNavigationTiming);
            }
          }
        });

        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Could not set up PerformanceObserver:', error);
      }
    }
  }

  /**
   * Update performance metrics from timing entry
   */
  private updatePerformanceMetrics(entry: PerformanceNavigationTiming): void {
    this.performanceMetrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ?
        entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      transfer: entry.responseEnd - entry.responseStart,
      total: entry.loadEventEnd - entry.fetchStart
    };
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      dns: 0,
      tcp: 0,
      ssl: 0,
      ttfb: 0,
      transfer: 0,
      total: 0
    };
  }

  /**
   * Create a new diagnostic test
   */
  private createTest(id: string, name: string, description: string): DiagnosticTest {
    const test: DiagnosticTest = {
      id,
      name,
      description,
      status: 'running',
      duration: 0,
      timestamp: new Date().toISOString()
    };

    this.testResults.push(test);
    return test;
  }

  /**
   * Complete a diagnostic test
   */
  private completeTest(test: DiagnosticTest, success: boolean, result: string): void {
    test.status = success ? 'passed' : 'failed';
    test.duration = Date.now() - new Date(test.timestamp).getTime();

    if (success) {
      test.result = result;
    } else {
      test.error = result;
    }
  }

  /**
   * Get settled value from Promise.allSettled result
   */
  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Connectivity recommendations
    if (!this.capabilities.onLine) {
      recommendations.push('Device is offline - check internet connection');
    }

    // Performance recommendations
    if (this.performanceMetrics.dns > 1000) {
      recommendations.push('DNS resolution is slow - consider using a faster DNS server');
    }

    if (this.performanceMetrics.ssl > 2000) {
      recommendations.push('SSL handshake is slow - check certificate configuration');
    }

    if (this.performanceMetrics.ttfb > 3000) {
      recommendations.push('Time to First Byte is high - server response optimization needed');
    }

    // Connection type recommendations
    if (this.capabilities.connection) {
      const conn = this.capabilities.connection;

      if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        recommendations.push('Slow connection detected - enable data saving features');
      }

      if (conn.saveData) {
        recommendations.push('Data saver mode is enabled - optimize for reduced data usage');
      }

      if (conn.rtt > 1000) {
        recommendations.push('High RTT detected - implement aggressive caching strategies');
      }
    }

    // Capability recommendations
    if (!this.capabilities.serviceWorker) {
      recommendations.push('Service Worker not available - offline functionality limited');
    }

    if (!this.capabilities.localStorage) {
      recommendations.push('Local Storage not available - client-side caching limited');
    }

    if (!this.capabilities.webSocket) {
      recommendations.push('WebSocket not supported - real-time features may not work');
    }

    return recommendations;
  }

  /**
   * Calculate overall network health score (0-100)
   */
  private calculateNetworkScore(connectivity: ConnectivityResult): number {
    let score = 0;

    // Connectivity (40% weight)
    if (connectivity.connectivity) score += 25;
    if (connectivity.dns) score += 15;

    // Latency (30% weight)
    if (connectivity.latency > 0) {
      if (connectivity.latency < 100) score += 30;
      else if (connectivity.latency < 300) score += 20;
      else if (connectivity.latency < 1000) score += 10;
      else if (connectivity.latency < 3000) score += 5;
    }

    // Bandwidth (20% weight)
    if (connectivity.bandwidth > 0) {
      if (connectivity.bandwidth >= 10) score += 20;
      else if (connectivity.bandwidth >= 5) score += 15;
      else if (connectivity.bandwidth >= 1) score += 10;
      else score += 5;
    }

    // Browser capabilities (10% weight)
    const capabilities = [
      this.capabilities.webSocket,
      this.capabilities.fetch,
      this.capabilities.localStorage,
      this.capabilities.serviceWorker
    ];

    const supportedCapabilities = capabilities.filter(c => c).length;
    score += (supportedCapabilities / capabilities.length) * 10;

    return Math.round(Math.max(0, Math.min(100, score)));
  }
}