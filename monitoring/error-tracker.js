#!/usr/bin/env node

/**
 * Error Tracker Agent
 *
 * Monitors application logs for errors, tracks error patterns, and alerts on critical issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ErrorTracker {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'monitoring', 'reports');
    this.logDir = path.join(process.cwd(), 'monitoring', 'logs');
    this.watchedLogs = [
      path.join(process.cwd(), '.next', 'trace'),
      path.join(process.cwd(), 'monitoring', 'logs'),
      '/var/log/nodejs', // System logs
    ];

    this.errorPatterns = [
      /ERROR/gi,
      /FATAL/gi,
      /Exception/gi,
      /Error:/gi,
      /Failed/gi,
      /Cannot/gi,
      /ECONNREFUSED/gi,
      /ETIMEDOUT/gi,
      /500/g, // HTTP 500 errors
      /404/g  // HTTP 404 errors
    ];

    this.errors = [];
    this.errorCounts = new Map();

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
    console.log('🔍 Error Tracker Agent started');
    this.log('INFO', 'Error tracking initialized');

    // Monitor log files every 30 seconds
    setInterval(() => {
      this.scanForErrors();
    }, 30000);

    // Generate error report every 5 minutes
    setInterval(() => {
      this.generateErrorReport();
    }, 300000);

    // Watch for new log files
    this.watchLogDirectories();
  }

  watchLogDirectories() {
    this.watchedLogs.forEach(logPath => {
      if (fs.existsSync(logPath)) {
        fs.watch(logPath, { recursive: true }, (eventType, filename) => {
          if (eventType === 'change' && filename && filename.endsWith('.log')) {
            this.scanLogFile(path.join(logPath, filename));
          }
        });
      }
    });
  }

  scanForErrors() {
    // Scan Next.js build logs
    const nextLogPath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextLogPath)) {
      this.scanDirectory(nextLogPath);
    }

    // Scan monitoring logs
    const monitoringLogPath = path.join(process.cwd(), 'monitoring', 'logs');
    if (fs.existsSync(monitoringLogPath)) {
      this.scanDirectory(monitoringLogPath);
    }

    // Scan application logs if they exist
    const appLogPath = path.join(process.cwd(), 'logs');
    if (fs.existsSync(appLogPath)) {
      this.scanDirectory(appLogPath);
    }
  }

  scanDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && this.isLogFile(file)) {
          this.scanLogFile(filePath);
        }
      });
    } catch (error) {
      // Ignore directory scan errors
    }
  }

  isLogFile(filename) {
    const logExtensions = ['.log', '.err', '.out'];
    return logExtensions.some(ext => filename.endsWith(ext)) ||
           filename.includes('error') ||
           filename.includes('debug');
  }

  scanLogFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkLineForErrors(line, filePath, index + 1);
      });

    } catch (error) {
      // File might be locked or deleted, skip silently
    }
  }

  checkLineForErrors(line, filePath, lineNumber) {
    this.errorPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        const errorKey = `${path.basename(filePath)}:${pattern.source}`;
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + matches.length);

        const error = {
          timestamp: new Date().toISOString(),
          file: filePath,
          line: lineNumber,
          pattern: pattern.source,
          content: line.trim(),
          severity: this.classifyError(line)
        };

        this.errors.push(error);
        this.processError(error);
      }
    });
  }

  classifyError(line) {
    const criticalKeywords = ['FATAL', 'CRITICAL', 'EMERGENCY', 'PANIC'];
    const warningKeywords = ['WARN', 'WARNING', 'DEPRECATED'];

    const upperLine = line.toUpperCase();

    if (criticalKeywords.some(keyword => upperLine.includes(keyword))) {
      return 'CRITICAL';
    } else if (warningKeywords.some(keyword => upperLine.includes(keyword))) {
      return 'WARNING';
    } else {
      return 'ERROR';
    }
  }

  processError(error) {
    if (error.severity === 'CRITICAL') {
      console.log(`🚨 CRITICAL ERROR detected in ${path.basename(error.file)}:${error.line}`);
      this.log('CRITICAL', `Error in ${error.file}:${error.line} - ${error.content.substring(0, 100)}`);
    }

    // Keep only last 500 errors
    if (this.errors.length > 500) {
      this.errors = this.errors.slice(-500);
    }
  }

  generateErrorReport() {
    const now = Date.now();
    const lastHour = now - 3600000;
    const recentErrors = this.errors.filter(error =>
      new Date(error.timestamp).getTime() > lastHour
    );

    const errorsByType = this.groupErrorsByType(recentErrors);
    const errorsByFile = this.groupErrorsByFile(recentErrors);
    const topErrors = this.getTopErrors(recentErrors);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_errors: recentErrors.length,
        critical_errors: recentErrors.filter(e => e.severity === 'CRITICAL').length,
        warning_errors: recentErrors.filter(e => e.severity === 'WARNING').length,
        unique_error_types: Object.keys(errorsByType).length
      },
      top_errors: topErrors,
      errors_by_type: errorsByType,
      errors_by_file: errorsByFile,
      error_trends: this.analyzeErrorTrends(),
      recommendations: this.generateErrorRecommendations(recentErrors)
    };

    // Write to file
    const reportFile = path.join(this.reportDir, `errors-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log('INFO', `Error report generated: ${report.summary.total_errors} errors in last hour`);

    if (report.summary.critical_errors > 0) {
      console.log(`🚨 ${report.summary.critical_errors} critical errors detected in the last hour!`);
    } else if (report.summary.total_errors > 10) {
      console.log(`⚠️  ${report.summary.total_errors} errors detected in the last hour`);
    } else {
      console.log(`✅ Low error rate: ${report.summary.total_errors} errors in last hour`);
    }
  }

  groupErrorsByType(errors) {
    const groups = {};
    errors.forEach(error => {
      const key = error.pattern;
      if (!groups[key]) {
        groups[key] = { count: 0, examples: [] };
      }
      groups[key].count++;
      if (groups[key].examples.length < 3) {
        groups[key].examples.push({
          content: error.content,
          file: path.basename(error.file),
          timestamp: error.timestamp
        });
      }
    });
    return groups;
  }

  groupErrorsByFile(errors) {
    const groups = {};
    errors.forEach(error => {
      const key = path.basename(error.file);
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }

  getTopErrors(errors) {
    const errorCounts = {};
    errors.forEach(error => {
      const key = `${error.pattern} in ${path.basename(error.file)}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  analyzeErrorTrends() {
    const now = Date.now();
    const periods = [
      { name: 'last_hour', duration: 3600000 },
      { name: 'last_6_hours', duration: 21600000 },
      { name: 'last_day', duration: 86400000 }
    ];

    const trends = {};
    periods.forEach(period => {
      const cutoff = now - period.duration;
      const periodErrors = this.errors.filter(error =>
        new Date(error.timestamp).getTime() > cutoff
      );
      trends[period.name] = periodErrors.length;
    });

    return trends;
  }

  generateErrorRecommendations(recentErrors) {
    const recommendations = [];

    const criticalCount = recentErrors.filter(e => e.severity === 'CRITICAL').length;
    if (criticalCount > 0) {
      recommendations.push(`IMMEDIATE_ACTION: ${criticalCount} critical errors require immediate attention`);
    }

    const totalErrors = recentErrors.length;
    if (totalErrors > 50) {
      recommendations.push('HIGH_ERROR_RATE: Error rate is high, investigate root causes');
    }

    // Check for common error patterns
    const connectionErrors = recentErrors.filter(e =>
      e.content.includes('ECONNREFUSED') || e.content.includes('ETIMEDOUT')
    );
    if (connectionErrors.length > 5) {
      recommendations.push('CONNECTION_ISSUES: Multiple connection errors detected, check network/services');
    }

    const memoryErrors = recentErrors.filter(e =>
      e.content.toLowerCase().includes('memory') || e.content.toLowerCase().includes('heap')
    );
    if (memoryErrors.length > 0) {
      recommendations.push('MEMORY_ISSUES: Memory-related errors detected, monitor memory usage');
    }

    return recommendations;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR-${level}] ${message}`;

    console.log(logEntry);

    const logFile = path.join(this.logDir, `error-tracker-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry + '\n');
  }
}

if (require.main === module) {
  new ErrorTracker();
}

module.exports = ErrorTracker;