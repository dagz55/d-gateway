#!/usr/bin/env node

/**
 * Monitoring Coordination Hub
 *
 * Central coordinator that manages all monitoring agents and provides unified oversight
 * Starts and manages all monitoring agents, aggregates reports, and provides centralized control
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const SystemHealthOversight = require('./system-health-oversight');

class MonitoringCoordinationHub {
  constructor() {
    this.agents = new Map();
    this.reportDir = path.join(process.cwd(), 'monitoring', 'reports');
    this.logDir = path.join(process.cwd(), 'monitoring', 'logs');
    this.startTime = Date.now();

    this.agentConfigs = [
      {
        name: 'system-health-oversight',
        file: './system-health-oversight.js',
        description: 'System Health Oversight Agent',
        autoRestart: true,
        critical: true
      },
      {
        name: 'performance-monitor',
        file: './performance-monitor.js',
        description: 'Performance Monitor Agent',
        autoRestart: true,
        critical: false
      },
      {
        name: 'error-tracker',
        file: './error-tracker.js',
        description: 'Error Tracker Agent',
        autoRestart: true,
        critical: false
      },
      {
        name: 'security-monitor',
        file: './security-monitor.js',
        description: 'Security Monitor Agent',
        autoRestart: true,
        critical: false
      }
    ];

    this.ensureDirectories();
    this.startCoordination();
  }

  ensureDirectories() {
    [this.reportDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  startCoordination() {
    console.log('🎛️  Monitoring Coordination Hub Starting...');
    this.log('INFO', 'Monitoring coordination hub initialized');

    // Start all monitoring agents
    this.startAllAgents();

    // Monitor agent health every minute
    setInterval(() => {
      this.monitorAgentHealth();
    }, 60000);

    // Generate consolidated report every 5 minutes
    setInterval(() => {
      this.generateConsolidatedReport();
    }, 300000);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    console.log('🚀 All monitoring agents started successfully');
    console.log('📊 Consolidated reports available in monitoring/reports/');
    console.log('⌨️  Press Ctrl+C to stop all monitoring\n');
  }

  startAllAgents() {
    this.agentConfigs.forEach(config => {
      this.startAgent(config);
    });
  }

  startAgent(config) {
    const agentPath = path.join(__dirname, config.file);

    if (!fs.existsSync(agentPath)) {
      this.log('ERROR', `Agent file not found: ${agentPath}`);
      return;
    }

    try {
      const process = spawn('node', [agentPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: path.dirname(agentPath),
        env: { ...process.env }
      });

      const agentData = {
        name: config.name,
        description: config.description,
        process: process,
        config: config,
        startTime: Date.now(),
        restartCount: 0,
        status: 'starting',
        lastHealthCheck: Date.now()
      };

      // Capture output
      let outputBuffer = '';
      let errorBuffer = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        outputBuffer += output;
        this.log('AGENT', `${config.name}: ${output.trim()}`);

        // Keep buffer size manageable
        if (outputBuffer.length > 10000) {
          outputBuffer = outputBuffer.slice(-5000);
        }
      });

      process.stderr.on('data', (data) => {
        const error = data.toString();
        errorBuffer += error;
        this.log('ERROR', `${config.name} ERROR: ${error.trim()}`);

        // Keep buffer size manageable
        if (errorBuffer.length > 10000) {
          errorBuffer = errorBuffer.slice(-5000);
        }
      });

      process.on('spawn', () => {
        agentData.status = 'running';
        this.log('INFO', `Agent started: ${config.name} (PID: ${process.pid})`);
      });

      process.on('error', (error) => {
        agentData.status = 'error';
        this.log('ERROR', `Agent ${config.name} error: ${error.message}`);
      });

      process.on('exit', (code, signal) => {
        agentData.status = 'stopped';
        const reason = signal ? `signal ${signal}` : `exit code ${code}`;
        this.log('WARNING', `Agent ${config.name} stopped (${reason})`);

        // Auto-restart if configured
        if (config.autoRestart && code !== 0) {
          setTimeout(() => {
            agentData.restartCount++;
            if (agentData.restartCount < 5) { // Limit restart attempts
              this.log('INFO', `Restarting agent ${config.name} (attempt ${agentData.restartCount})`);
              this.startAgent(config);
            } else {
              this.log('ERROR', `Agent ${config.name} failed too many times, giving up`);
            }
          }, 5000); // Wait 5 seconds before restart
        }
      });

      agentData.outputBuffer = () => outputBuffer;
      agentData.errorBuffer = () => errorBuffer;

      this.agents.set(config.name, agentData);

    } catch (error) {
      this.log('ERROR', `Failed to start agent ${config.name}: ${error.message}`);
    }
  }

  monitorAgentHealth() {
    this.agents.forEach((agent, name) => {
      if (agent.status === 'running') {
        // Check if process is still alive
        try {
          process.kill(agent.process.pid, 0); // Signal 0 checks if process exists
          agent.lastHealthCheck = Date.now();
          agent.uptime = Date.now() - agent.startTime;
        } catch (error) {
          agent.status = 'dead';
          this.log('ERROR', `Agent ${name} process is dead`);
        }
      }
    });
  }

  generateConsolidatedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      hub_uptime: Math.floor((Date.now() - this.startTime) / 1000),
      agents: this.getAgentStatusSummary(),
      system_overview: this.generateSystemOverview(),
      consolidated_alerts: this.consolidateAlerts(),
      recommendations: this.generateHubRecommendations()
    };

    // Write consolidated report
    const reportFile = path.join(this.reportDir, `consolidated-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.displayConsolidatedStatus(report);
    this.log('INFO', 'Consolidated monitoring report generated');
  }

  getAgentStatusSummary() {
    const summary = {};
    this.agents.forEach((agent, name) => {
      summary[name] = {
        status: agent.status,
        uptime: agent.status === 'running' ? Math.floor((Date.now() - agent.startTime) / 1000) : 0,
        restart_count: agent.restartCount,
        description: agent.description,
        pid: agent.process?.pid || null,
        critical: agent.config.critical
      };
    });
    return summary;
  }

  generateSystemOverview() {
    const runningAgents = Array.from(this.agents.values()).filter(agent => agent.status === 'running').length;
    const totalAgents = this.agents.size;
    const criticalAgentsDown = Array.from(this.agents.values()).filter(agent =>
      agent.config.critical && agent.status !== 'running'
    ).length;

    return {
      total_agents: totalAgents,
      running_agents: runningAgents,
      agent_health: `${runningAgents}/${totalAgents}`,
      critical_agents_down: criticalAgentsDown,
      overall_status: criticalAgentsDown > 0 ? 'CRITICAL' :
                     runningAgents < totalAgents ? 'WARNING' : 'HEALTHY'
    };
  }

  consolidateAlerts() {
    const alerts = [];

    // Check for critical agent failures
    this.agents.forEach((agent, name) => {
      if (agent.config.critical && agent.status !== 'running') {
        alerts.push({
          severity: 'CRITICAL',
          source: 'coordination_hub',
          message: `Critical monitoring agent ${name} is not running`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Add agent restart alerts
    this.agents.forEach((agent, name) => {
      if (agent.restartCount > 0) {
        alerts.push({
          severity: agent.restartCount > 3 ? 'HIGH' : 'MEDIUM',
          source: 'coordination_hub',
          message: `Agent ${name} has restarted ${agent.restartCount} times`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return alerts;
  }

  generateHubRecommendations() {
    const recommendations = [];

    const downAgents = Array.from(this.agents.values()).filter(agent => agent.status !== 'running');
    if (downAgents.length > 0) {
      recommendations.push(`RESTART_AGENTS: ${downAgents.length} monitoring agents are down`);
    }

    const highRestartAgents = Array.from(this.agents.values()).filter(agent => agent.restartCount > 3);
    if (highRestartAgents.length > 0) {
      recommendations.push(`INVESTIGATE_INSTABILITY: ${highRestartAgents.length} agents showing instability`);
    }

    const criticalDown = Array.from(this.agents.values()).filter(agent =>
      agent.config.critical && agent.status !== 'running'
    );
    if (criticalDown.length > 0) {
      recommendations.push('URGENT: Critical monitoring agents are down - system visibility compromised');
    }

    return recommendations;
  }

  displayConsolidatedStatus(report) {
    const statusIcon = {
      'HEALTHY': '✅',
      'WARNING': '⚠️',
      'CRITICAL': '🚨'
    };

    console.log('\n' + '='.repeat(70));
    console.log('🎛️  MONITORING COORDINATION HUB STATUS');
    console.log('='.repeat(70));
    console.log(`${statusIcon[report.system_overview.overall_status]} Overall Status: ${report.system_overview.overall_status}`);
    console.log(`🕒 Hub Uptime: ${Math.floor(report.hub_uptime / 3600)}h ${Math.floor((report.hub_uptime % 3600) / 60)}m`);
    console.log(`🤖 Agent Health: ${report.system_overview.agent_health}`);

    console.log('\n📊 Agent Status:');
    Object.entries(report.agents).forEach(([name, agent]) => {
      const statusIcon = agent.status === 'running' ? '✅' : '❌';
      const criticalIcon = agent.critical ? '🔴' : '🟡';
      console.log(`   ${statusIcon} ${criticalIcon} ${name}: ${agent.status} (${Math.floor(agent.uptime / 60)}m uptime)`);
    });

    if (report.consolidated_alerts.length > 0) {
      console.log('\n🚨 Consolidated Alerts:');
      report.consolidated_alerts.forEach(alert => {
        console.log(`   ${alert.severity}: ${alert.message}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Hub Recommendations:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    console.log('\n' + '='.repeat(70));
    console.log('Next status update in 5 minutes\n');
  }

  // Control methods
  stopAgent(agentName) {
    const agent = this.agents.get(agentName);
    if (agent && agent.process) {
      try {
        agent.process.kill('SIGTERM');
        this.log('INFO', `Stopping agent: ${agentName}`);
        return true;
      } catch (error) {
        this.log('ERROR', `Failed to stop agent ${agentName}: ${error.message}`);
        return false;
      }
    }
    return false;
  }

  restartAgent(agentName) {
    const agent = this.agents.get(agentName);
    if (agent) {
      this.stopAgent(agentName);
      setTimeout(() => {
        this.startAgent(agent.config);
      }, 2000);
      return true;
    }
    return false;
  }

  getAgentLogs(agentName) {
    const agent = this.agents.get(agentName);
    if (agent) {
      return {
        output: agent.outputBuffer(),
        error: agent.errorBuffer(),
        status: agent.status,
        uptime: Date.now() - agent.startTime
      };
    }
    return null;
  }

  shutdown() {
    console.log('\n🔄 Monitoring Coordination Hub shutting down...');
    this.log('INFO', 'Hub shutdown initiated');

    // Stop all agents
    this.agents.forEach((agent, name) => {
      try {
        agent.process.kill('SIGTERM');
        this.log('INFO', `Stopped agent: ${name}`);
      } catch (error) {
        this.log('ERROR', `Failed to stop agent ${name}: ${error.message}`);
      }
    });

    // Generate final report
    this.generateConsolidatedReport();

    this.log('INFO', 'Monitoring coordination hub shutdown complete');
    console.log('✅ All monitoring agents stopped');
    process.exit(0);
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [HUB-${level}] ${message}`;

    // Console output with color coding
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      WARNING: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m',   // Red
      AGENT: '\x1b[32m'    // Green
    };
    console.log(`${colors[level] || ''}${logEntry}\x1b[0m`);

    // Write to log file
    const logFile = path.join(this.logDir, `coordination-hub-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry + '\n');
  }
}

// CLI interface for manual control
if (require.main === module) {
  const hub = new MonitoringCoordinationHub();

  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];
    const agentName = args[1];

    switch (command) {
      case 'stop':
        if (agentName) {
          hub.stopAgent(agentName);
        } else {
          console.log('Usage: node coordination-hub.js stop <agent-name>');
        }
        break;
      case 'restart':
        if (agentName) {
          hub.restartAgent(agentName);
        } else {
          console.log('Usage: node coordination-hub.js restart <agent-name>');
        }
        break;
      case 'logs':
        if (agentName) {
          const logs = hub.getAgentLogs(agentName);
          if (logs) {
            console.log(`\n=== ${agentName.toUpperCase()} LOGS ===`);
            console.log('OUTPUT:', logs.output);
            console.log('ERRORS:', logs.error);
          } else {
            console.log(`Agent ${agentName} not found`);
          }
        } else {
          console.log('Usage: node coordination-hub.js logs <agent-name>');
        }
        break;
      case 'status':
        // Status will be displayed by the regular monitoring cycle
        break;
      default:
        console.log('Available commands: stop, restart, logs, status');
    }
  }
}

module.exports = MonitoringCoordinationHub;