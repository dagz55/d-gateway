#!/usr/bin/env node

/**
 * Performance Monitor Agent
 *
 * Monitors application performance metrics, response times, and resource usage
 * Works in coordination with System Health Oversight Agent
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class PerformanceMonitor {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'monitoring', 'reports');
    this.logDir = path.join(process.cwd(), 'monitoring', 'logs');
    this.metrics = {
      responseTime: [],
      throughput: [],
      errorRate: [],
      memoryLeaks: []
    };

    this.ensureDirectories();
    this.startMonitoring();
  }

  ensureDirectories() {
    [this.reportDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  startMonitoring() {
    console.log('📊 Performance Monitor Agent started');
    this.log('INFO', 'Performance monitoring initialized');

    // Monitor every 2 minutes
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 120000);

    // Generate performance report every 10 minutes
    setInterval(() => {
      this.generatePerformanceReport();
    }, 600000);
  }

  async collectPerformanceMetrics() {
    const startTime = Date.now();

    try {
      // Test main application endpoints
      const endpoints = [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/api/health'
      ];

      for (const endpoint of endpoints) {
        const responseData = await this.measureEndpoint(endpoint);
        this.metrics.responseTime.push({
          timestamp: Date.now(),
          endpoint,
          ...responseData
        });
      }

      // Monitor memory usage trends
      const memUsage = process.memoryUsage();
      this.metrics.memoryLeaks.push({
        timestamp: Date.now(),
        ...memUsage
      });

      // Trim old metrics (keep last 100 entries)
      Object.keys(this.metrics).forEach(metric => {
        if (this.metrics[metric].length > 100) {
          this.metrics[metric] = this.metrics[metric].slice(-100);
        }
      });

    } catch (error) {
      this.log('ERROR', `Performance metrics collection failed: ${error.message}`);
    }
  }

  async measureEndpoint(url) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const timeout = 10000;
      const req = http.get(url, { timeout }, (res) => {
        const endTime = Date.now();
        res.resume(); // Consume response

        resolve({
          responseTime: endTime - startTime,
          statusCode: res.statusCode,
          status: res.statusCode < 400 ? 'success' : 'error'
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          responseTime: Date.now() - startTime,
          statusCode: 0,
          status: 'timeout'
        });
      });

      req.on('error', (error) => {
        resolve({
          responseTime: Date.now() - startTime,
          statusCode: 0,
          status: 'error',
          error: error.message
        });
      });
    });
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.calculatePerformanceSummary(),
      trends: this.analyzeTrends(),
      recommendations: this.generatePerformanceRecommendations()
    };

    // Write to file
    const reportFile = path.join(this.reportDir, `performance-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log('INFO', `Performance report generated: ${report.summary.avgResponseTime}ms avg response time`);
    console.log(`📊 Performance Report: ${report.summary.avgResponseTime}ms avg response time, ${report.summary.errorRate}% error rate`);
  }

  calculatePerformanceSummary() {
    const recentMetrics = this.metrics.responseTime.filter(m =>
      Date.now() - m.timestamp < 600000 // Last 10 minutes
    );

    if (recentMetrics.length === 0) {
      return { avgResponseTime: 0, errorRate: 0, totalRequests: 0 };
    }

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    const errorCount = recentMetrics.filter(m => m.status === 'error').length;
    const errorRate = (errorCount / recentMetrics.length) * 100;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests: recentMetrics.length
    };
  }

  analyzeTrends() {
    // Simple trend analysis
    const recent = this.metrics.responseTime.slice(-20);
    const older = this.metrics.responseTime.slice(-40, -20);

    if (recent.length < 5 || older.length < 5) return { trend: 'insufficient_data' };

    const recentAvg = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.responseTime, 0) / older.length;

    const trend = recentAvg > olderAvg * 1.2 ? 'degrading' :
                  recentAvg < olderAvg * 0.8 ? 'improving' : 'stable';

    return { trend, recentAvg: Math.round(recentAvg), olderAvg: Math.round(olderAvg) };
  }

  generatePerformanceRecommendations() {
    const recommendations = [];
    const summary = this.calculatePerformanceSummary();

    if (summary.avgResponseTime > 2000) {
      recommendations.push('HIGH_RESPONSE_TIME: Response times are high, consider caching or optimization');
    }

    if (summary.errorRate > 5) {
      recommendations.push('HIGH_ERROR_RATE: Error rate is elevated, investigate error logs');
    }

    const memoryTrend = this.checkMemoryTrend();
    if (memoryTrend.increasing) {
      recommendations.push('MEMORY_LEAK: Memory usage is consistently increasing, check for leaks');
    }

    return recommendations;
  }

  checkMemoryTrend() {
    const recentMemory = this.metrics.memoryLeaks.slice(-10);
    if (recentMemory.length < 5) return { increasing: false };

    const trend = recentMemory.slice(-5).reduce((sum, m) => sum + m.heapUsed, 0) / 5 >
                  recentMemory.slice(0, 5).reduce((sum, m) => sum + m.heapUsed, 0) / 5 * 1.1;

    return { increasing: trend };
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [PERF-${level}] ${message}`;

    console.log(logEntry);

    const logFile = path.join(this.logDir, `performance-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry + '\n');
  }
}

if (require.main === module) {
  new PerformanceMonitor();
}

module.exports = PerformanceMonitor;