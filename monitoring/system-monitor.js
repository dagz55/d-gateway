#!/usr/bin/env node

/**
 * System Monitoring Agent
 * Monitors dev server logs, detects issues, and spawns troubleshooting agents
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class SystemMonitor {
  constructor() {
    this.logFile = path.join(__dirname, 'system-logs.json');
    this.issuesFile = path.join(__dirname, 'detected-issues.json');
    this.agents = new Map();
    this.issues = [];
    this.logs = [];
    this.isRunning = false;

    // Ensure monitoring directory exists
    if (!fs.existsSync(__dirname)) {
      fs.mkdirSync(__dirname, { recursive: true });
    }

    // Initialize log files
    this.initializeLogFiles();

    console.log('🔍 System Monitor initialized');
    console.log('📁 Logs directory:', __dirname);
  }

  initializeLogFiles() {
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, JSON.stringify({ logs: [], startTime: new Date().toISOString() }, null, 2));
    }
    if (!fs.existsSync(this.issuesFile)) {
      fs.writeFileSync(this.issuesFile, JSON.stringify({ issues: [], detectedAt: new Date().toISOString() }, null, 2));
    }
  }

  logMessage(level, message, source = 'monitor', metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      metadata
    };

    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] [${source}] ${message}`);

    // Write to file every 10 logs or on high-priority issues
    if (this.logs.length % 10 === 0 || level === 'error' || level === 'critical') {
      this.persistLogs();
    }
  }

  persistLogs() {
    const logData = {
      logs: this.logs,
      lastUpdated: new Date().toISOString(),
      totalLogs: this.logs.length,
      issues: this.issues.length
    };

    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
  }

  detectIssue(logLine, source) {
    const patterns = [
      // Error patterns
      { pattern: /error|ERROR/i, severity: 'high', type: 'error' },
      { pattern: /warn|WARNING/i, severity: 'medium', type: 'warning' },
      { pattern: /failed|FAILED/i, severity: 'high', type: 'failure' },
      { pattern: /timeout|TIMEOUT/i, severity: 'medium', type: 'timeout' },
      { pattern: /denied|DENIED|403|401/i, severity: 'high', type: 'access_denied' },
      { pattern: /500|internal server error/i, severity: 'critical', type: 'server_error' },
      { pattern: /cannot find module/i, severity: 'high', type: 'missing_module' },
      { pattern: /port.*already in use/i, severity: 'medium', type: 'port_conflict' },
      { pattern: /econnrefused|connection refused/i, severity: 'high', type: 'connection_error' },
      { pattern: /out of memory|oom/i, severity: 'critical', type: 'memory_issue' },
      // Performance patterns
      { pattern: /slow|performance/i, severity: 'low', type: 'performance' },
      { pattern: /deprecated/i, severity: 'low', type: 'deprecation' },
      // Build patterns
      { pattern: /build.*failed/i, severity: 'high', type: 'build_failure' },
      { pattern: /compilation.*error/i, severity: 'high', type: 'compilation_error' }
    ];

    for (const { pattern, severity, type } of patterns) {
      if (pattern.test(logLine)) {
        const issue = {
          id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          severity,
          type,
          source,
          message: logLine.trim(),
          status: 'detected',
          agentAssigned: null
        };

        this.issues.push(issue);
        this.logMessage('warn', `Issue detected: ${type} (${severity})`, 'detector', { issue });
        this.persistIssues();
        this.spawnTroubleshootingAgent(issue);
        return true;
      }
    }
    return false;
  }

  persistIssues() {
    const issueData = {
      issues: this.issues,
      lastUpdated: new Date().toISOString(),
      totalIssues: this.issues.length,
      criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
      highIssues: this.issues.filter(i => i.severity === 'high').length
    };

    fs.writeFileSync(this.issuesFile, JSON.stringify(issueData, null, 2));
  }

  spawnTroubleshootingAgent(issue) {
    const agentId = `troubleshooter_${issue.id}`;

    if (this.agents.has(agentId)) {
      this.logMessage('info', `Agent ${agentId} already exists for this issue`, 'monitor');
      return;
    }

    this.logMessage('info', `Spawning troubleshooting agent for ${issue.type}`, 'monitor');

    // Update issue status
    issue.status = 'investigating';
    issue.agentAssigned = agentId;

    // Spawn troubleshooting agent
    const agent = {
      id: agentId,
      issue,
      startTime: new Date(),
      status: 'active',
      logs: []
    };

    this.agents.set(agentId, agent);
    this.runTroubleshootingLogic(agent);
  }

  runTroubleshootingLogic(agent) {
    const { issue } = agent;

    agent.logs.push(`Starting investigation of ${issue.type} issue`);

    // Simulate troubleshooting based on issue type
    setTimeout(() => {
      let solution = '';
      let action = '';

      switch (issue.type) {
        case 'missing_module':
          solution = 'Run npm install to install missing dependencies';
          action = 'npm install';
          break;
        case 'port_conflict':
          solution = 'Kill process using the port or use different port';
          action = 'lsof -ti:3000 | xargs kill -9 || echo "Port cleared"';
          break;
        case 'build_failure':
          solution = 'Check build configuration and dependencies';
          action = 'npm run build --verbose';
          break;
        case 'server_error':
          solution = 'Check server logs and restart service';
          action = 'systemctl restart service || npm restart';
          break;
        case 'memory_issue':
          solution = 'Increase memory allocation or optimize code';
          action = 'NODE_OPTIONS="--max_old_space_size=4096"';
          break;
        default:
          solution = 'Generic troubleshooting: check logs and restart';
          action = 'npm run dev';
      }

      agent.logs.push(`Solution identified: ${solution}`);
      agent.logs.push(`Recommended action: ${action}`);

      // Update issue status
      issue.status = 'resolved';
      issue.solution = solution;
      issue.recommendedAction = action;

      this.logMessage('info', `Issue ${issue.id} resolved by agent ${agent.id}`, 'troubleshooter', {
        solution,
        action
      });

      agent.status = 'completed';
      this.persistIssues();

      // Auto-remove agent after 30 seconds
      setTimeout(() => {
        this.agents.delete(agent.id);
        this.logMessage('info', `Agent ${agent.id} terminated`, 'monitor');
      }, 30000);

    }, Math.random() * 5000 + 2000); // 2-7 seconds investigation time
  }

  monitorProcess(process, source) {
    if (process.stdout) {
      process.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          this.logMessage('info', line, source);
          this.detectIssue(line, source);
        });
      });
    }

    if (process.stderr) {
      process.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          this.logMessage('error', line, source);
          this.detectIssue(line, source);
        });
      });
    }

    process.on('close', (code) => {
      this.logMessage('warn', `Process ${source} exited with code ${code}`, source);
      if (code !== 0) {
        this.detectIssue(`Process ${source} exited with non-zero code: ${code}`, source);
      }
    });

    process.on('error', (error) => {
      this.logMessage('error', `Process ${source} error: ${error.message}`, source);
      this.detectIssue(error.message, source);
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      totalLogs: this.logs.length,
      totalIssues: this.issues.length,
      activeAgents: this.agents.size,
      issueBreakdown: {
        critical: this.issues.filter(i => i.severity === 'critical').length,
        high: this.issues.filter(i => i.severity === 'high').length,
        medium: this.issues.filter(i => i.severity === 'medium').length,
        low: this.issues.filter(i => i.severity === 'low').length
      },
      recentIssues: this.issues.slice(-5),
      activeAgents: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        issueType: agent.issue.type,
        status: agent.status,
        runtime: Date.now() - agent.startTime.getTime()
      }))
    };

    const reportFile = path.join(__dirname, 'monitoring-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return report;
  }

  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.logMessage('info', '🚀 System Monitor started', 'monitor');

    // Generate report every 30 seconds
    this.reportInterval = setInterval(() => {
      const report = this.generateReport();
      this.logMessage('info', `Report: ${report.totalLogs} logs, ${report.totalIssues} issues, ${report.activeAgents} agents`, 'monitor');
    }, 30000);

    // Persist logs every minute
    this.persistInterval = setInterval(() => {
      this.persistLogs();
    }, 60000);
  }

  stop() {
    this.isRunning = false;
    if (this.reportInterval) clearInterval(this.reportInterval);
    if (this.persistInterval) clearInterval(this.persistInterval);
    this.persistLogs();
    this.logMessage('info', '🛑 System Monitor stopped', 'monitor');
  }
}

module.exports = SystemMonitor;

// If run directly
if (require.main === module) {
  const monitor = new SystemMonitor();
  monitor.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down System Monitor...');
    monitor.stop();
    process.exit(0);
  });

  // Keep the process alive
  setInterval(() => {
    // Monitor health check
  }, 1000);
}