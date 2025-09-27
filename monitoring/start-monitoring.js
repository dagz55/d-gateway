#!/usr/bin/env node

/**
 * Monitoring System Startup Script
 *
 * Easy way to start the complete monitoring system
 * Provides options for different monitoring modes
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const MONITORING_DIR = __dirname;

function showUsage() {
  console.log('\n🎛️  Zignal Monitoring System');
  console.log('==========================\n');
  console.log('Usage: npm run monitor [mode]');
  console.log('   or: node monitoring/start-monitoring.js [mode]\n');
  console.log('Available modes:');
  console.log('  full     - Start all monitoring agents (default)');
  console.log('  minimal  - Start only system health oversight');
  console.log('  security - Start only security monitoring');
  console.log('  perf     - Start only performance monitoring');
  console.log('  hub      - Start coordination hub only');
  console.log('  status   - Show current monitoring status\n');
  console.log('Examples:');
  console.log('  npm run monitor full');
  console.log('  npm run monitor security');
  console.log('  npm run monitor status\n');
}

function startMonitoring(mode = 'full') {
  console.log(`🚀 Starting monitoring system in ${mode.toUpperCase()} mode...\n`);

  const configs = {
    full: {
      name: 'Full Monitoring System',
      script: 'coordination-hub.js',
      description: 'All monitoring agents with coordination hub'
    },
    minimal: {
      name: 'Minimal Monitoring',
      script: 'system-health-oversight.js',
      description: 'System health oversight only'
    },
    security: {
      name: 'Security Monitoring',
      script: 'security-monitor.js',
      description: 'Security monitoring only'
    },
    perf: {
      name: 'Performance Monitoring',
      script: 'performance-monitor.js',
      description: 'Performance monitoring only'
    },
    hub: {
      name: 'Coordination Hub',
      script: 'coordination-hub.js',
      description: 'Coordination hub only'
    }
  };

  const config = configs[mode];
  if (!config) {
    console.error(`❌ Unknown mode: ${mode}`);
    showUsage();
    process.exit(1);
  }

  const scriptPath = path.join(MONITORING_DIR, config.script);

  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Monitoring script not found: ${scriptPath}`);
    process.exit(1);
  }

  console.log(`📊 ${config.name}`);
  console.log(`📝 ${config.description}\n`);

  try {
    const monitoringProcess = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: MONITORING_DIR
    });

    monitoringProcess.on('error', (error) => {
      console.error(`❌ Failed to start monitoring: ${error.message}`);
      process.exit(1);
    });

    monitoringProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Monitoring system shut down gracefully');
      } else {
        console.log(`\n❌ Monitoring system exited with code ${code}`);
      }
      process.exit(code);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔄 Stopping monitoring system...');
      monitoringProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 Stopping monitoring system...');
      monitoringProcess.kill('SIGTERM');
    });

  } catch (error) {
    console.error(`❌ Error starting monitoring: ${error.message}`);
    process.exit(1);
  }
}

function showStatus() {
  const reportDir = path.join(MONITORING_DIR, 'reports');
  const logDir = path.join(MONITORING_DIR, 'logs');

  console.log('\n📊 MONITORING SYSTEM STATUS');
  console.log('===========================\n');

  // Check if monitoring directories exist
  const hasReports = fs.existsSync(reportDir);
  const hasLogs = fs.existsSync(logDir);

  console.log(`📁 Reports Directory: ${hasReports ? '✅ Exists' : '❌ Missing'}`);
  console.log(`📁 Logs Directory: ${hasLogs ? '✅ Exists' : '❌ Missing'}\n`);

  if (hasReports) {
    try {
      const reportFiles = fs.readdirSync(reportDir)
        .filter(file => file.endsWith('.json'))
        .sort()
        .slice(-5); // Last 5 reports

      console.log('📋 Recent Reports:');
      if (reportFiles.length === 0) {
        console.log('   No reports found');
      } else {
        reportFiles.forEach(file => {
          const filePath = path.join(reportDir, file);
          const stats = fs.statSync(filePath);
          console.log(`   ${file} (${stats.mtime.toLocaleString()})`);
        });
      }
      console.log();
    } catch (error) {
      console.log('   Error reading reports directory\n');
    }
  }

  if (hasLogs) {
    try {
      const logFiles = fs.readdirSync(logDir)
        .filter(file => file.endsWith('.log'))
        .sort()
        .slice(-5); // Last 5 log files

      console.log('📝 Recent Log Files:');
      if (logFiles.length === 0) {
        console.log('   No log files found');
      } else {
        logFiles.forEach(file => {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`   ${file} (${sizeMB}MB, ${stats.mtime.toLocaleString()})`);
        });
      }
      console.log();
    } catch (error) {
      console.log('   Error reading logs directory\n');
    }
  }

  // Check if monitoring is currently running
  console.log('🔍 Process Check:');
  try {
    const { execSync } = require('child_process');
    const processes = execSync('ps aux | grep "monitoring" | grep -v grep', { encoding: 'utf8' });

    if (processes.trim()) {
      console.log('   ✅ Monitoring processes detected:');
      processes.trim().split('\n').forEach(proc => {
        const parts = proc.split(/\s+/);
        const pid = parts[1];
        const command = parts.slice(10).join(' ');
        console.log(`     PID ${pid}: ${command}`);
      });
    } else {
      console.log('   ❌ No monitoring processes found');
    }
  } catch (error) {
    console.log('   ⚠️  Unable to check for running processes');
  }

  console.log('\n💡 To start monitoring:');
  console.log('   npm run monitor full');
  console.log('   node monitoring/start-monitoring.js full\n');
}

// Main execution
const mode = process.argv[2] || 'full';

if (mode === 'help' || mode === '-h' || mode === '--help') {
  showUsage();
} else if (mode === 'status') {
  showStatus();
} else {
  startMonitoring(mode);
}

// Export for use as module
module.exports = {
  startMonitoring,
  showStatus,
  showUsage
};