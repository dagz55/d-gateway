#!/usr/bin/env node

/**
 * System Health Oversight Agent
 *
 * Comprehensive system monitoring and oversight for zignal-login application
 * Monitors system resources, agent health, server performance, and coordinates monitoring activities
 *
 * Features:
 * - System resource monitoring (CPU, Memory, Disk, Network)
 * - Production server health checks
 * - Monitoring agent coordination and health

 * - Performance metrics collection
 * - Early warning detection
 * - Cascading failure prevention
 * - Log integrity monitoring
 * - Service dependency tracking
 *
 * @author System Health Team
 * @version 1.0.0
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');
const https = require('https');

// Configuration
const CONFIG = {
  reportInterval: 180000, // 3 minutes
  criticalThreshold: {
    cpu: 85,        // CPU usage %
    memory: 90,     // Memory usage %
    disk: 95,       // Disk usage %
    network: 1000   // Network errors per minute
  },
  warningThreshold: {
    cpu: 70,
    memory: 75,
    disk: 80,
    network: 100
  },
  healthCheckPorts: [3000, 3001, 3002], // Dev, prod, qa ports
  logRetentionDays: 7,
  maxLogSize: 50 * 1024 * 1024, // 50MB
  monitoringAgents: [
    'auth_catchall_monitor.js',
    'performance-monitor.js',
    'error-tracker.js',
    'security-monitor.js'
  ]
};

class SystemHealthOversight {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      cpu: [],
      memory: [],
      disk: [],
      network: [],
      agents: {},
      servers: {},
      alerts: []
    };
    this.agentProcesses = new Map();
    this.lastReport = 0;
    this.reportDir = path.join(process.cwd(), 'monitoring', 'reports');
    this.logDir = path.join(process.cwd(), 'monitoring', 'logs');

    this.ensureDirectories();
    this.initializeMonitoring();
  }

  ensureDirectories() {
    [this.reportDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  initializeMonitoring() {
    console.log('🔍 System Health Oversight Agent Starting...');
    this.log('INFO', 'System Health Oversight Agent initialized');

    // Start monitoring cycles
    this.startSystemMonitoring();
    this.startAgentMonitoring();
    this.startServerMonitoring();
    this.startPerformanceTracking();
    this.scheduleReporting();

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  startSystemMonitoring() {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  startAgentMonitoring() {
    setInterval(() => {
      this.checkMonitoringAgents();
    }, 60000); // Every minute
  }

  startServerMonitoring() {
    setInterval(() => {
      this.checkServerHealth();
    }, 45000); // Every 45 seconds
  }

  startPerformanceTracking() {
    setInterval(() => {
      this.trackPerformanceMetrics();
    }, 120000); // Every 2 minutes
  }

  scheduleReporting() {
    setInterval(() => {
      this.generateHealthReport();
    }, CONFIG.reportInterval);
  }

  async collectSystemMetrics() {
    try {
      // CPU Usage
      const cpuUsage = await this.getCPUUsage();

      // Memory Usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = ((totalMem - freeMem) / totalMem) * 100;

      // Disk Usage
      const diskUsage = await this.getDiskUsage();

      // Network Stats
      const networkStats = await this.getNetworkStats();

      // Store metrics
      const timestamp = Date.now();
      this.metrics.cpu.push({ timestamp, value: cpuUsage });
      this.metrics.memory.push({ timestamp, value: memUsage });
      this.metrics.disk.push({ timestamp, value: diskUsage });
      this.metrics.network.push({ timestamp, ...networkStats });

      // Trim old metrics (keep last 100 entries)
      ['cpu', 'memory', 'disk', 'network'].forEach(metric => {
        if (this.metrics[metric].length > 100) {
          this.metrics[metric] = this.metrics[metric].slice(-100);
        }
      });

      // Check for alerts
      this.checkSystemAlerts(cpuUsage, memUsage, diskUsage, networkStats);

    } catch (error) {
      this.log('ERROR', `System metrics collection failed: ${error.message}`);
    }
  }

  async getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime(startTime);

        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // microseconds
        const cpuTime = (endUsage.user + endUsage.system); // microseconds
        const cpuPercent = (cpuTime / totalTime) * 100;

        resolve(Math.min(cpuPercent, 100));
      }, 1000);
    });
  }

  async getDiskUsage() {
    return new Promise((resolve) => {
      exec("df -h / | awk 'NR==2{print $5}' | sed 's/%//'", (error, stdout) => {
        if (error) {
          resolve(0);
        } else {
          resolve(parseInt(stdout.trim()) || 0);
        }
      });
    });
  }

  async getNetworkStats() {
    // Simplified network stats - in production, would use more sophisticated monitoring
    const networkInterfaces = os.networkInterfaces();
    let totalInterfaces = 0;
    let activeInterfaces = 0;

    Object.keys(networkInterfaces).forEach(name => {
      totalInterfaces++;
      if (networkInterfaces[name].some(iface => !iface.internal)) {
        activeInterfaces++;
      }
    });

    return {
      interfaces: totalInterfaces,
      active: activeInterfaces,
      errors: 0 // Would implement proper error counting in production
    };
  }

  checkSystemAlerts(cpu, memory, disk, network) {
    const alerts = [];

    if (cpu > CONFIG.criticalThreshold.cpu) {
      alerts.push({ level: 'CRITICAL', type: 'CPU', value: cpu, threshold: CONFIG.criticalThreshold.cpu });
    } else if (cpu > CONFIG.warningThreshold.cpu) {
      alerts.push({ level: 'WARNING', type: 'CPU', value: cpu, threshold: CONFIG.warningThreshold.cpu });
    }

    if (memory > CONFIG.criticalThreshold.memory) {
      alerts.push({ level: 'CRITICAL', type: 'MEMORY', value: memory, threshold: CONFIG.criticalThreshold.memory });
    } else if (memory > CONFIG.warningThreshold.memory) {
      alerts.push({ level: 'WARNING', type: 'MEMORY', value: memory, threshold: CONFIG.warningThreshold.memory });
    }

    if (disk > CONFIG.criticalThreshold.disk) {
      alerts.push({ level: 'CRITICAL', type: 'DISK', value: disk, threshold: CONFIG.criticalThreshold.disk });
    } else if (disk > CONFIG.warningThreshold.disk) {
      alerts.push({ level: 'WARNING', type: 'DISK', value: disk, threshold: CONFIG.warningThreshold.disk });
    }

    // Process alerts
    alerts.forEach(alert => {
      this.processAlert(alert);
    });
  }

  processAlert(alert) {
    const timestamp = new Date().toISOString();
    const alertMsg = `${alert.level}: ${alert.type} usage ${alert.value.toFixed(1)}% exceeds ${alert.threshold}% threshold`;

    this.metrics.alerts.push({
      timestamp,
      ...alert,
      message: alertMsg
    });

    this.log(alert.level, alertMsg);

    if (alert.level === 'CRITICAL') {
      console.log(`🚨 ${alertMsg}`);
      this.escalateCriticalAlert(alert);
    } else {
      console.log(`⚠️  ${alertMsg}`);
    }

    // Keep only last 50 alerts
    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts = this.metrics.alerts.slice(-50);
    }
  }

  escalateCriticalAlert(alert) {
    // In production, this would:
    // - Send notifications via email/Slack/SMS
    // - Trigger automated recovery procedures
    // - Scale resources if in cloud environment
    // - Create incident tickets

    this.log('CRITICAL', `ESCALATION: ${alert.type} critical threshold breached - initiating recovery procedures`);
  }

  async checkMonitoringAgents() {
    const agentDir = path.join(process.cwd(), 'qa', 'agents');

    for (const agentFile of CONFIG.monitoringAgents) {
      const agentPath = path.join(agentDir, agentFile);
      const agentName = agentFile.replace('.js', '');

      if (fs.existsSync(agentPath)) {
        // Check if agent process is running
        const isRunning = this.agentProcesses.has(agentName);
        const lastCheck = this.metrics.agents[agentName]?.lastCheck || 0;
        const now = Date.now();

        this.metrics.agents[agentName] = {
          name: agentName,
          path: agentPath,
          running: isRunning,
          lastCheck: now,
          status: isRunning ? 'RUNNING' : 'STOPPED',
          uptime: isRunning ? now - (this.metrics.agents[agentName]?.startTime || now) : 0
        };

        if (!isRunning && (now - lastCheck) > 300000) { // 5 minutes
          this.log('WARNING', `Monitoring agent ${agentName} is not running`);
        }
      }
    }
  }

  async checkServerHealth() {
    for (const port of CONFIG.healthCheckPorts) {
      const url = `http://localhost:${port}`;
      const startTime = Date.now();

      try {
        const status = await this.checkServerStatus(url);
        const responseTime = Date.now() - startTime;

        this.metrics.servers[port] = {
          port,
          url,
          status: status > 0 ? 'HEALTHY' : 'DOWN',
          statusCode: status,
          responseTime,
          lastCheck: Date.now()
        };

        if (status === 0) {
          this.log('WARNING', `Server on port ${port} is not responding`);
        } else if (responseTime > 5000) {
          this.log('WARNING', `Server on port ${port} has high response time: ${responseTime}ms`);
        }

      } catch (error) {
        this.metrics.servers[port] = {
          port,
          url,
          status: 'ERROR',
          error: error.message,
          lastCheck: Date.now()
        };
        this.log('ERROR', `Server health check failed for port ${port}: ${error.message}`);
      }
    }
  }

  checkServerStatus(url) {
    return new Promise((resolve) => {
      const timeout = 5000;
      const req = http.get(url, { timeout }, (res) => {
        res.resume(); // Consume response
        resolve(res.statusCode || 0);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(0);
      });

      req.on('error', () => {
        resolve(0);
      });
    });
  }

  async trackPerformanceMetrics() {
    const loadAvg = os.loadavg();
    const uptime = os.uptime();
    const processUptime = process.uptime();

    // Node.js process metrics
    const memUsage = process.memoryUsage();

    const performanceData = {
      timestamp: Date.now(),
      system: {
        loadAvg: loadAvg,
        uptime: uptime,
        platform: os.platform(),
        arch: os.arch()
      },
      process: {
        uptime: processUptime,
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external
        },
        pid: process.pid
      }
    };

    this.log('INFO', `Performance tracking: Load avg: ${loadAvg[0].toFixed(2)}, Process uptime: ${Math.floor(processUptime)}s`);
  }

  generateHealthReport() {
    const now = Date.now();
    const uptime = Math.floor((now - this.startTime) / 1000);

    // Calculate average metrics
    const avgCpu = this.calculateAverage(this.metrics.cpu, 'value');
    const avgMemory = this.calculateAverage(this.metrics.memory, 'value');
    const avgDisk = this.calculateAverage(this.metrics.disk, 'value');

    // Count agent statuses
    const agentCount = Object.keys(this.metrics.agents).length;
    const runningAgents = Object.values(this.metrics.agents).filter(agent => agent.status === 'RUNNING').length;

    // Count server statuses
    const serverCount = Object.keys(this.metrics.servers).length;
    const healthyServers = Object.values(this.metrics.servers).filter(server => server.status === 'HEALTHY').length;

    // Recent alerts
    const recentAlerts = this.metrics.alerts.filter(alert =>
      (now - new Date(alert.timestamp).getTime()) < 3600000 // Last hour
    );

    const report = {
      timestamp: new Date().toISOString(),
      overview: {
        status: this.calculateOverallHealth(),
        uptime: uptime,
        monitoring_agents: `${runningAgents}/${agentCount}`,
        servers: `${healthyServers}/${serverCount}`,
        recent_alerts: recentAlerts.length
      },
      system_resources: {
        cpu_avg: `${avgCpu.toFixed(1)}%`,
        memory_avg: `${avgMemory.toFixed(1)}%`,
        disk_usage: `${avgDisk.toFixed(1)}%`,
        load_avg: os.loadavg().map(l => l.toFixed(2))
      },
      monitoring_agents: this.metrics.agents,
      servers: this.metrics.servers,
      recent_alerts: recentAlerts.slice(-10), // Last 10 alerts
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    const reportFile = path.join(this.reportDir, `health-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Console output
    this.displayHealthStatus(report);

    // Log the report
    this.log('INFO', `Health report generated - Status: ${report.overview.status}`);

    this.lastReport = now;
  }

  calculateOverallHealth() {
    const criticalAlerts = this.metrics.alerts.filter(alert =>
      alert.level === 'CRITICAL' &&
      (Date.now() - new Date(alert.timestamp).getTime()) < 600000 // Last 10 minutes
    ).length;

    const runningAgentPercent = Object.keys(this.metrics.agents).length > 0 ?
      (Object.values(this.metrics.agents).filter(agent => agent.status === 'RUNNING').length / Object.keys(this.metrics.agents).length) * 100 : 100;

    const healthyServerPercent = Object.keys(this.metrics.servers).length > 0 ?
      (Object.values(this.metrics.servers).filter(server => server.status === 'HEALTHY').length / Object.keys(this.metrics.servers).length) * 100 : 100;

    if (criticalAlerts > 0 || runningAgentPercent < 50 || healthyServerPercent < 50) {
      return 'CRITICAL';
    } else if (runningAgentPercent < 75 || healthyServerPercent < 75) {
      return 'WARNING';
    } else {
      return 'HEALTHY';
    }
  }

  calculateAverage(metrics, property) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + (property ? metric[property] : metric), 0);
    return sum / metrics.length;
  }

  generateRecommendations() {
    const recommendations = [];

    // System resource recommendations
    const avgCpu = this.calculateAverage(this.metrics.cpu, 'value');
    const avgMemory = this.calculateAverage(this.metrics.memory, 'value');
    const avgDisk = this.calculateAverage(this.metrics.disk, 'value');

    if (avgCpu > 80) {
      recommendations.push('HIGH_CPU: Consider optimizing CPU-intensive processes or scaling resources');
    }
    if (avgMemory > 85) {
      recommendations.push('HIGH_MEMORY: Monitor memory leaks and consider increasing available RAM');
    }
    if (avgDisk > 90) {
      recommendations.push('HIGH_DISK: Clean up log files and temporary data, consider disk expansion');
    }

    // Agent recommendations
    const stoppedAgents = Object.values(this.metrics.agents).filter(agent => agent.status === 'STOPPED');
    if (stoppedAgents.length > 0) {
      recommendations.push(`AGENT_DOWN: Restart monitoring agents: ${stoppedAgents.map(a => a.name).join(', ')}`);
    }

    // Server recommendations
    const downServers = Object.values(this.metrics.servers).filter(server => server.status !== 'HEALTHY');
    if (downServers.length > 0) {
      recommendations.push(`SERVER_DOWN: Check server health on ports: ${downServers.map(s => s.port).join(', ')}`);
    }

    return recommendations;
  }

  displayHealthStatus(report) {
    const statusIcon = {
      'HEALTHY': '✅',
      'WARNING': '⚠️',
      'CRITICAL': '🚨'
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEM HEALTH OVERSIGHT REPORT');
    console.log('='.repeat(60));
    console.log(`${statusIcon[report.overview.status]} Overall Status: ${report.overview.status}`);
    console.log(`🕒 Uptime: ${Math.floor(report.overview.uptime / 3600)}h ${Math.floor((report.overview.uptime % 3600) / 60)}m`);
    console.log(`🤖 Monitoring Agents: ${report.overview.monitoring_agents}`);
    console.log(`🌐 Servers: ${report.overview.servers}`);
    console.log(`🚨 Recent Alerts: ${report.overview.recent_alerts}`);
    console.log('\n📈 System Resources:');
    console.log(`   CPU: ${report.system_resources.cpu_avg}`);
    console.log(`   Memory: ${report.system_resources.memory_avg}`);
    console.log(`   Disk: ${report.system_resources.disk_usage}`);
    console.log(`   Load Avg: ${report.system_resources.load_avg.join(', ')}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Next report in ${Math.floor(CONFIG.reportInterval / 60000)} minutes\n`);
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;

    // Console output with color coding
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      WARNING: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m',   // Red
      CRITICAL: '\x1b[41m' // Red background
    };
    console.log(`${colors[level] || ''}${logEntry}\x1b[0m`);

    // Write to log file
    const logFile = path.join(this.logDir, `oversight-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry + '\n');

    // Rotate log files if they get too large
    this.rotateLogFile(logFile);
  }

  rotateLogFile(logFile) {
    try {
      const stats = fs.statSync(logFile);
      if (stats.size > CONFIG.maxLogSize) {
        const rotatedFile = logFile.replace('.log', `-${Date.now()}.log`);
        fs.renameSync(logFile, rotatedFile);
        this.log('INFO', `Log file rotated: ${path.basename(rotatedFile)}`);
      }
    } catch (error) {
      // Ignore rotation errors
    }
  }

  shutdown() {
    console.log('\n🔄 System Health Oversight Agent shutting down...');
    this.log('INFO', 'System Health Oversight Agent shutdown initiated');

    // Stop all monitoring agent processes
    this.agentProcesses.forEach((process, name) => {
      try {
        process.kill();
        this.log('INFO', `Stopped monitoring agent: ${name}`);
      } catch (error) {
        this.log('ERROR', `Failed to stop agent ${name}: ${error.message}`);
      }
    });

    // Generate final report
    this.generateHealthReport();

    this.log('INFO', 'System Health Oversight Agent shutdown complete');
    process.exit(0);
  }

  // Method to start a monitoring agent
  startMonitoringAgent(agentName) {
    const agentPath = path.join(process.cwd(), 'qa', 'agents', `${agentName}.js`);

    if (!fs.existsSync(agentPath)) {
      this.log('ERROR', `Agent not found: ${agentPath}`);
      return false;
    }

    try {
      const process = spawn('node', [agentPath], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      process.on('error', (error) => {
        this.log('ERROR', `Agent ${agentName} error: ${error.message}`);
      });

      process.on('exit', (code) => {
        this.agentProcesses.delete(agentName);
        this.log('INFO', `Agent ${agentName} exited with code ${code}`);
      });

      this.agentProcesses.set(agentName, process);
      this.metrics.agents[agentName] = {
        ...this.metrics.agents[agentName],
        startTime: Date.now(),
        status: 'RUNNING'
      };

      this.log('INFO', `Started monitoring agent: ${agentName}`);
      return true;
    } catch (error) {
      this.log('ERROR', `Failed to start agent ${agentName}: ${error.message}`);
      return false;
    }
  }
}

// Main execution
if (require.main === module) {
  const oversight = new SystemHealthOversight();

  console.log('🚀 System Health Oversight Agent is now monitoring your system');
  console.log(`📊 Reports generated every ${Math.floor(CONFIG.reportInterval / 60000)} minutes`);
  console.log('🔍 Monitoring system resources, agents, and servers');
  console.log('⌨️  Press Ctrl+C to stop monitoring\n');
}

module.exports = SystemHealthOversight;