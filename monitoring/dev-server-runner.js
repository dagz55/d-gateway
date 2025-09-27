#!/usr/bin/env node

/**
 * Dev Server Runner with Monitoring
 * Runs build -> start sequence with comprehensive monitoring
 */

const { spawn } = require('child_process');
const path = require('path');
const SystemMonitor = require('./system-monitor');

class DevServerRunner {
  constructor() {
    this.monitor = new SystemMonitor();
    this.processes = new Map();
    this.buildProcess = null;
    this.serverProcess = null;
  }

  async runBuild() {
    return new Promise((resolve, reject) => {
      this.monitor.logMessage('info', '🔨 Starting build process...', 'build');

      this.buildProcess = spawn('npm', ['run', 'build'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });

      this.monitor.monitorProcess(this.buildProcess, 'build');

      this.buildProcess.on('close', (code) => {
        if (code === 0) {
          this.monitor.logMessage('info', '✅ Build completed successfully', 'build');
          resolve();
        } else {
          this.monitor.logMessage('error', `❌ Build failed with code ${code}`, 'build');
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.monitor.logMessage('info', '🚀 Starting production server...', 'server');

      this.serverProcess = spawn('npm', ['run', 'start'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
      });

      this.monitor.monitorProcess(this.serverProcess, 'server');

      // Consider server started after 5 seconds if no errors
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          this.monitor.logMessage('info', '✅ Production server started successfully', 'server');
          resolve();
        }
      }, 5000);

      this.serverProcess.on('close', (code) => {
        this.monitor.logMessage('warn', `Server process exited with code ${code}`, 'server');
        if (code !== 0) {
          reject(new Error(`Server failed with code ${code}`));
        }
      });
    });
  }

  async runHealthChecks() {
    this.monitor.logMessage('info', '🏥 Running health checks...', 'health');

    const healthChecks = [
      this.checkServerHealth(),
      this.checkMemoryUsage(),
      this.checkDiskSpace(),
      this.checkNetworkConnectivity()
    ];

    const results = await Promise.allSettled(healthChecks);

    results.forEach((result, index) => {
      const checks = ['server', 'memory', 'disk', 'network'];
      if (result.status === 'fulfilled') {
        this.monitor.logMessage('info', `✅ ${checks[index]} check passed`, 'health');
      } else {
        this.monitor.logMessage('error', `❌ ${checks[index]} check failed: ${result.reason}`, 'health');
      }
    });
  }

  async checkServerHealth() {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          resolve('Server responding');
        } else {
          reject(`Server returned status ${res.statusCode}`);
        }
      });

      req.on('error', (error) => {
        reject(`Health check failed: ${error.message}`);
      });

      req.setTimeout(5000, () => {
        req.abort();
        reject('Health check timeout');
      });
    });
  }

  async checkMemoryUsage() {
    const used = process.memoryUsage();
    const memInfo = {
      rss: Math.round(used.rss / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024)
    };

    if (memInfo.heapUsed > 512) { // 512MB threshold
      throw new Error(`High memory usage: ${memInfo.heapUsed}MB`);
    }

    return memInfo;
  }

  async checkDiskSpace() {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec('df -h .', (error, stdout) => {
        if (error) {
          reject(`Disk check failed: ${error.message}`);
          return;
        }

        const lines = stdout.split('\n');
        const diskLine = lines[1];
        const usage = diskLine.match(/(\d+)%/);

        if (usage && parseInt(usage[1]) > 90) {
          reject(`Disk space critical: ${usage[1]}% used`);
        } else {
          resolve(`Disk usage: ${usage ? usage[1] : 'unknown'}%`);
        }
      });
    });
  }

  async checkNetworkConnectivity() {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec('ping -c 1 8.8.8.8', (error) => {
        if (error) {
          reject('Network connectivity failed');
        } else {
          resolve('Network connectivity OK');
        }
      });
    });
  }

  async simulateTraffic() {
    this.monitor.logMessage('info', '🚦 Simulating traffic...', 'traffic');

    const endpoints = [
      'http://localhost:3000',
      'http://localhost:3000/api/health',
      'http://localhost:3000/dashboard',
      'http://localhost:3000/sign-in'
    ];

    for (let i = 0; i < 10; i++) {
      setTimeout(async () => {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        try {
          const http = require('http');
          http.get(endpoint, (res) => {
            this.monitor.logMessage('info', `Traffic: ${endpoint} -> ${res.statusCode}`, 'traffic');
          }).on('error', (error) => {
            this.monitor.logMessage('error', `Traffic error: ${endpoint} -> ${error.message}`, 'traffic');
          });
        } catch (error) {
          this.monitor.logMessage('error', `Traffic simulation error: ${error.message}`, 'traffic');
        }
      }, i * 2000); // Stagger requests every 2 seconds
    }
  }

  async run() {
    try {
      console.log('🎯 Starting comprehensive dev server monitoring...\n');

      // Start monitoring
      this.monitor.start();

      // Phase 1: Build
      await this.runBuild();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Phase 2: Start server
      await this.startServer();
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Phase 3: Health checks
      await this.runHealthChecks();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Phase 4: Simulate traffic
      await this.simulateTraffic();

      // Phase 5: Continuous monitoring
      this.monitor.logMessage('info', '👁️  Entering continuous monitoring mode...', 'monitor');

      // Generate detailed report every minute
      setInterval(() => {
        const report = this.monitor.generateReport();
        console.log(`\n📊 Status Report:`);
        console.log(`   Logs: ${report.totalLogs} | Issues: ${report.totalIssues} | Agents: ${report.activeAgents}`);
        console.log(`   Critical: ${report.issueBreakdown.critical} | High: ${report.issueBreakdown.high}`);
        console.log(`   Uptime: ${Math.floor(report.uptime / 1000)}s\n`);
      }, 60000);

      // Keep monitoring alive
      console.log('✅ Dev server monitoring is active. Press Ctrl+C to stop.\n');

    } catch (error) {
      this.monitor.logMessage('critical', `System failure: ${error.message}`, 'system');
      console.error('❌ Dev server monitoring failed:', error.message);
      process.exit(1);
    }
  }

  stop() {
    console.log('\n🛑 Stopping dev server monitoring...');

    if (this.buildProcess && !this.buildProcess.killed) {
      this.buildProcess.kill();
    }

    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill();
    }

    this.monitor.stop();
  }
}

// If run directly
if (require.main === module) {
  const runner = new DevServerRunner();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    runner.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    runner.stop();
    process.exit(0);
  });

  // Start the monitoring system
  runner.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DevServerRunner;