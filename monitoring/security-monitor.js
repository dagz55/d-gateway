#!/usr/bin/env node

/**
 * Security Monitor Agent
 *
 * Monitors for security-related events, unauthorized access attempts, and vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class SecurityMonitor {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'monitoring', 'reports');
    this.logDir = path.join(process.cwd(), 'monitoring', 'logs');

    this.securityEvents = [];
    this.ipAttempts = new Map(); // Track failed login attempts by IP
    this.suspiciousActivity = [];

    this.securityPatterns = [
      // Authentication attempts
      /failed.?login/gi,
      /unauthorized/gi,
      /forbidden/gi,
      /access.?denied/gi,
      /authentication.?failed/gi,

      // Injection attempts
      /select.*from/gi,
      /union.*select/gi,
      /script.*alert/gi,
      /javascript:/gi,
      /<script/gi,

      // File access attempts
      /\.\.\/\.\./g,
      /\/etc\/passwd/gi,
      /\/proc\//gi,

      // Suspicious requests
      /admin.*php/gi,
      /wp-admin/gi,
      /phpmyadmin/gi,
      /shell/gi,
      /cmd=/gi
    ];

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
    console.log('🛡️  Security Monitor Agent started');
    this.log('INFO', 'Security monitoring initialized');

    // Monitor security events every minute
    setInterval(() => {
      this.scanForSecurityEvents();
    }, 60000);

    // Check for brute force attempts every 2 minutes
    setInterval(() => {
      this.analyzeFailedAttempts();
    }, 120000);

    // Generate security report every 10 minutes
    setInterval(() => {
      this.generateSecurityReport();
    }, 600000);

    // Monitor file system for suspicious changes
    this.startFileSystemMonitoring();
  }

  scanForSecurityEvents() {
    // Scan various log sources
    const logSources = [
      path.join(process.cwd(), 'monitoring', 'logs'),
      path.join(process.cwd(), '.next', 'trace'),
      '/var/log/auth.log', // System auth logs (if accessible)
      '/var/log/nginx',    // Web server logs (if accessible)
    ];

    logSources.forEach(logPath => {
      if (fs.existsSync(logPath)) {
        this.scanLogSource(logPath);
      }
    });
  }

  scanLogSource(logPath) {
    try {
      if (fs.statSync(logPath).isDirectory()) {
        const files = fs.readdirSync(logPath);
        files.forEach(file => {
          if (this.isLogFile(file)) {
            this.scanLogFile(path.join(logPath, file));
          }
        });
      } else if (this.isLogFile(path.basename(logPath))) {
        this.scanLogFile(logPath);
      }
    } catch (error) {
      // Ignore access errors
    }
  }

  isLogFile(filename) {
    return filename.endsWith('.log') ||
           filename.includes('access') ||
           filename.includes('error') ||
           filename.includes('auth');
  }

  scanLogFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkLineForSecurity(line, filePath, index + 1);
      });

    } catch (error) {
      // File might be inaccessible or locked
    }
  }

  checkLineForSecurity(line, filePath, lineNumber) {
    this.securityPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        const event = {
          timestamp: new Date().toISOString(),
          file: filePath,
          line: lineNumber,
          pattern: pattern.source,
          content: line.trim(),
          severity: this.classifySecurityEvent(line, pattern),
          ip: this.extractIP(line)
        };

        this.securityEvents.push(event);
        this.procesSecurityEvent(event);
      }
    });

    // Check for specific security indicators
    this.checkForBruteForce(line);
    this.checkForSuspiciousUserAgents(line);
  }

  classifySecurityEvent(line, pattern) {
    const criticalPatterns = [
      /select.*from/gi,
      /union.*select/gi,
      /\.\.\/\.\./g,
      /\/etc\/passwd/gi
    ];

    const highPatterns = [
      /script.*alert/gi,
      /<script/gi,
      /admin.*php/gi,
      /shell/gi
    ];

    if (criticalPatterns.some(p => line.match(p))) {
      return 'CRITICAL';
    } else if (highPatterns.some(p => line.match(p))) {
      return 'HIGH';
    } else {
      return 'MEDIUM';
    }
  }

  extractIP(line) {
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
    const match = line.match(ipPattern);
    return match ? match[0] : null;
  }

  checkForBruteForce(line) {
    if (line.toLowerCase().includes('failed') && line.toLowerCase().includes('login')) {
      const ip = this.extractIP(line);
      if (ip) {
        const attempts = this.ipAttempts.get(ip) || { count: 0, firstSeen: Date.now() };
        attempts.count++;
        attempts.lastSeen = Date.now();
        this.ipAttempts.set(ip, attempts);

        // Alert if more than 5 failed attempts in 10 minutes
        if (attempts.count > 5 && (attempts.lastSeen - attempts.firstSeen) < 600000) {
          this.reportBruteForce(ip, attempts);
        }
      }
    }
  }

  checkForSuspiciousUserAgents(line) {
    const suspiciousAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'gobuster',
      'dirb',
      'python-requests',
      'curl/7', // Basic curl without proper user agent
    ];

    suspiciousAgents.forEach(agent => {
      if (line.toLowerCase().includes(agent.toLowerCase())) {
        this.suspiciousActivity.push({
          timestamp: new Date().toISOString(),
          type: 'suspicious_user_agent',
          agent: agent,
          line: line.trim(),
          ip: this.extractIP(line)
        });
      }
    });
  }

  reportBruteForce(ip, attempts) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'brute_force_attempt',
      ip: ip,
      attempts: attempts.count,
      duration: attempts.lastSeen - attempts.firstSeen,
      severity: 'HIGH'
    };

    this.securityEvents.push(event);
    console.log(`🚨 BRUTE FORCE: ${ip} made ${attempts.count} failed login attempts`);
    this.log('HIGH', `Brute force detected from ${ip}: ${attempts.count} attempts`);
  }

  procesSecurityEvent(event) {
    if (event.severity === 'CRITICAL') {
      console.log(`🚨 CRITICAL SECURITY EVENT: ${event.pattern} in ${path.basename(event.file)}`);
      this.log('CRITICAL', `Security event: ${event.content.substring(0, 100)}`);
    }

    // Keep only last 1000 security events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  analyzeFailedAttempts() {
    const now = Date.now();
    const threshold = 10 * 60 * 1000; // 10 minutes

    // Clean up old attempts
    for (const [ip, attempts] of this.ipAttempts.entries()) {
      if (now - attempts.lastSeen > threshold) {
        this.ipAttempts.delete(ip);
      }
    }
  }

  startFileSystemMonitoring() {
    // Monitor critical files for changes
    const criticalFiles = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), 'middleware.ts'),
      path.join(process.cwd(), 'package.json'),
    ];

    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.watchFile(file, (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            this.reportFileChange(file, curr, prev);
          }
        });
      }
    });

    // Monitor sensitive directories
    const sensitiveDirectories = [
      path.join(process.cwd(), 'lib'),
      path.join(process.cwd(), 'app'),
      path.join(process.cwd(), 'components'),
    ];

    sensitiveDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (eventType === 'change' && filename) {
            this.reportFileSystemEvent(dir, eventType, filename);
          }
        });
      }
    });
  }

  reportFileChange(filePath, curr, prev) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'file_modification',
      file: filePath,
      severity: 'MEDIUM',
      details: {
        size_change: curr.size - prev.size,
        modified: curr.mtime.toISOString(),
        previous_modified: prev.mtime.toISOString()
      }
    };

    this.securityEvents.push(event);
    this.log('MEDIUM', `Critical file modified: ${path.basename(filePath)}`);
  }

  reportFileSystemEvent(dir, eventType, filename) {
    // Only report on sensitive files
    const sensitiveExtensions = ['.js', '.ts', '.jsx', '.tsx', '.env', '.json', '.sql'];
    if (sensitiveExtensions.some(ext => filename.endsWith(ext))) {
      const event = {
        timestamp: new Date().toISOString(),
        type: 'filesystem_change',
        directory: dir,
        filename: filename,
        eventType: eventType,
        severity: 'LOW'
      };

      this.suspiciousActivity.push(event);
    }
  }

  generateSecurityReport() {
    const now = Date.now();
    const lastHour = now - 3600000;
    const recentEvents = this.securityEvents.filter(event =>
      new Date(event.timestamp).getTime() > lastHour
    );

    const eventsBySeverity = this.groupEventsBySeverity(recentEvents);
    const topThreats = this.identifyTopThreats(recentEvents);
    const ipAnalysis = this.analyzeIPActivity();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_events: recentEvents.length,
        critical_events: eventsBySeverity.CRITICAL || 0,
        high_events: eventsBySeverity.HIGH || 0,
        medium_events: eventsBySeverity.MEDIUM || 0,
        suspicious_ips: Array.from(this.ipAttempts.keys()).length,
        brute_force_attempts: recentEvents.filter(e => e.type === 'brute_force_attempt').length
      },
      top_threats: topThreats,
      ip_analysis: ipAnalysis,
      events_by_severity: eventsBySeverity,
      recent_suspicious_activity: this.suspiciousActivity.slice(-20),
      security_recommendations: this.generateSecurityRecommendations(recentEvents)
    };

    // Write to file
    const reportFile = path.join(this.reportDir, `security-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log('INFO', `Security report generated: ${report.summary.total_events} events, ${report.summary.critical_events} critical`);

    if (report.summary.critical_events > 0) {
      console.log(`🚨 ${report.summary.critical_events} critical security events detected!`);
    } else if (report.summary.high_events > 0) {
      console.log(`⚠️  ${report.summary.high_events} high-severity security events detected`);
    } else {
      console.log(`✅ Security status: ${report.summary.total_events} events, no critical threats`);
    }
  }

  groupEventsBySeverity(events) {
    const groups = {};
    events.forEach(event => {
      groups[event.severity] = (groups[event.severity] || 0) + 1;
    });
    return groups;
  }

  identifyTopThreats(events) {
    const threats = {};
    events.forEach(event => {
      const key = event.pattern || event.type;
      threats[key] = (threats[key] || 0) + 1;
    });

    return Object.entries(threats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([threat, count]) => ({ threat, count }));
  }

  analyzeIPActivity() {
    const analysis = [];
    for (const [ip, attempts] of this.ipAttempts.entries()) {
      analysis.push({
        ip: ip,
        failed_attempts: attempts.count,
        first_seen: new Date(attempts.firstSeen).toISOString(),
        last_seen: new Date(attempts.lastSeen).toISOString(),
        risk_level: attempts.count > 10 ? 'HIGH' : attempts.count > 5 ? 'MEDIUM' : 'LOW'
      });
    }
    return analysis.sort((a, b) => b.failed_attempts - a.failed_attempts).slice(0, 20);
  }

  generateSecurityRecommendations(recentEvents) {
    const recommendations = [];

    const criticalCount = recentEvents.filter(e => e.severity === 'CRITICAL').length;
    if (criticalCount > 0) {
      recommendations.push('IMMEDIATE_ACTION: Critical security events detected - investigate immediately');
    }

    const bruteForceCount = recentEvents.filter(e => e.type === 'brute_force_attempt').length;
    if (bruteForceCount > 0) {
      recommendations.push('IMPLEMENT_RATE_LIMITING: Brute force attempts detected - implement rate limiting');
    }

    const injectionAttempts = recentEvents.filter(e =>
      e.pattern && (e.pattern.includes('select') || e.pattern.includes('script'))
    ).length;
    if (injectionAttempts > 0) {
      recommendations.push('INPUT_VALIDATION: SQL/XSS injection attempts detected - review input validation');
    }

    if (this.ipAttempts.size > 10) {
      recommendations.push('IP_MONITORING: Multiple IPs showing suspicious activity - consider IP blocking');
    }

    return recommendations;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [SEC-${level}] ${message}`;

    console.log(logEntry);

    const logFile = path.join(this.logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry + '\n');
  }
}

if (require.main === module) {
  new SecurityMonitor();
}

module.exports = SecurityMonitor;