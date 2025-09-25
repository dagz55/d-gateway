# System Health Oversight & Monitoring

A comprehensive monitoring system for the Zignal trading platform that provides real-time system health oversight, performance monitoring, error tracking, and security monitoring.

## Overview

The System Health Oversight Agent is the central coordinator that maintains overall system health and coordinates between specialized monitoring agents. It provides:

- **System Resource Monitoring** - CPU, Memory, Disk, Network usage
- **Production Server Health Checks** - Application availability and response times
- **Monitoring Agent Coordination** - Health and performance of monitoring agents
- **Performance Metrics Collection** - Response times, throughput, error rates
- **Early Warning Detection** - Automated alerting on threshold breaches
- **Cascading Failure Prevention** - Proactive monitoring to prevent system overloads
- **Log Integrity Monitoring** - Automated log analysis and rotation
- **Service Dependency Tracking** - Monitor interdependent services and APIs

## Architecture

### Core Components

1. **System Health Oversight** (`system-health-oversight.js`) - Main coordinator
2. **Performance Monitor** (`performance-monitor.js`) - Application performance metrics
3. **Error Tracker** (`error-tracker.js`) - Log analysis and error pattern detection
4. **Security Monitor** (`security-monitor.js`) - Security event detection and analysis
5. **Coordination Hub** (`coordination-hub.js`) - Central management and reporting

### Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Coordination Hub                             │
│                 (Central Management)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────▼────────┐ ┌────▼────────┐ ┌────▼──────────┐
│ System Health    │ │ Performance │ │ Error Tracker │
│ Oversight        │ │ Monitor     │ │               │
└──────────────────┘ └─────────────┘ └───────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                ┌─────────▼──────────┐
                │ Security Monitor   │
                │                    │
                └────────────────────┘
```

## Quick Start

### Start Full Monitoring System

```bash
npm run monitor
# or
npm run monitor:full
```

### Start Specific Monitoring Components

```bash
npm run monitor:minimal      # System health only
npm run monitor:security     # Security monitoring only
npm run monitor:performance  # Performance monitoring only
npm run monitor:status       # Show current status
```

### Manual Control

```bash
# Start coordination hub
node monitoring/coordination-hub.js

# Individual agents
node monitoring/system-health-oversight.js
node monitoring/performance-monitor.js
node monitoring/error-tracker.js
node monitoring/security-monitor.js
```

## Configuration

### System Thresholds

Edit `monitoring/system-health-oversight.js` to modify:

```javascript
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
  }
};
```

### Monitoring Ports

The system monitors these default ports:
- `3000` - Main application (development)
- `3001` - Production server
- `3002` - QA server

## Monitoring Features

### 1. System Health Oversight

**Monitors:**
- CPU usage and load averages
- Memory consumption and trends
- Disk space utilization
- Network interface status
- Process health and uptime

**Alerts:**
- Resource threshold breaches
- System performance degradation
- Service unavailability
- Memory leaks detection

**Reports every 3 minutes:**
```
📊 SYSTEM HEALTH OVERSIGHT REPORT
✅ Overall Status: HEALTHY
🕒 Uptime: 2h 45m
🤖 Monitoring Agents: 4/4
🌐 Servers: 3/3
🚨 Recent Alerts: 0

📈 System Resources:
   CPU: 15.2%
   Memory: 68.5%
   Disk: 45.8%
   Load Avg: 0.85, 0.92, 1.01
```

### 2. Performance Monitoring

**Tracks:**
- Response times for key endpoints
- Throughput and request rates
- Error rates and status codes
- Memory usage trends
- Performance degradation patterns

**Endpoints Monitored:**
- `/` - Landing page
- `/dashboard` - Main application
- `/api/health` - Health check endpoint

**Alerts on:**
- Response times > 2000ms
- Error rates > 5%
- Memory leaks detected
- Performance degradation trends

### 3. Error Tracking

**Scans for:**
- Application errors and exceptions
- HTTP error status codes (4xx, 5xx)
- Connection failures (ECONNREFUSED, ETIMEDOUT)
- Critical system errors
- Warning patterns

**Log Sources:**
- Next.js build logs (`.next/trace`)
- Application logs (`logs/`)
- Monitoring system logs (`monitoring/logs/`)
- System logs (when accessible)

**Error Classification:**
- `CRITICAL` - System failures, panics
- `WARNING` - Non-fatal issues, deprecations
- `ERROR` - Application errors, exceptions

### 4. Security Monitoring

**Detects:**
- Failed authentication attempts
- SQL injection attempts
- XSS attack patterns
- Directory traversal attempts
- Brute force login attacks
- Suspicious user agents
- Unauthorized file access

**Brute Force Protection:**
- Tracks failed login attempts by IP
- Alerts on >5 attempts in 10 minutes
- Maintains IP attempt history

**File System Monitoring:**
- Watches critical configuration files
- Monitors sensitive directories
- Alerts on unauthorized changes

## Reports and Logs

### Report Locations

All reports are stored in `monitoring/reports/`:

```
monitoring/reports/
├── health-report-2025-01-25.json       # System health
├── performance-2025-01-25.json         # Performance metrics
├── errors-2025-01-25.json              # Error analysis
├── security-2025-01-25.json            # Security events
└── consolidated-2025-01-25.json        # Combined report
```

### Log Files

All logs are stored in `monitoring/logs/`:

```
monitoring/logs/
├── oversight-2025-01-25.log            # System oversight
├── performance-2025-01-25.log          # Performance monitoring
├── error-tracker-2025-01-25.log        # Error tracking
├── security-2025-01-25.log             # Security monitoring
└── coordination-hub-2025-01-25.log     # Hub coordination
```

### Log Rotation

- Automatic log rotation when files exceed 50MB
- Rotated files are timestamped
- Old logs are retained for 7 days

## Alert Levels

### CRITICAL 🚨
- Immediate action required
- System stability at risk
- Service unavailability
- Security breaches detected

**Examples:**
- CPU usage > 85%
- Memory usage > 90%
- Critical monitoring agents down
- SQL injection attempts detected

### WARNING ⚠️
- Attention needed soon
- Performance degradation
- Non-critical errors

**Examples:**
- CPU usage > 70%
- High error rates
- Agent restarts detected
- Failed login attempts

### INFO ℹ️
- Normal operational messages
- Status updates
- Routine maintenance

## Troubleshooting

### Common Issues

#### 1. Monitoring Not Starting

```bash
# Check if ports are already in use
npm run monitor:status

# Kill any existing processes
pkill -f "monitoring"

# Start fresh
npm run monitor:full
```

#### 2. High Memory Usage

The monitoring system is designed to be lightweight:
- Memory usage typically <50MB per agent
- Automatic cleanup of old metrics
- Log rotation to prevent disk bloat

#### 3. Missing Reports

```bash
# Check if directories exist
ls -la monitoring/reports/
ls -la monitoring/logs/

# Restart monitoring
npm run monitor:full
```

#### 4. Agent Failures

The coordination hub automatically restarts failed agents:
- Up to 5 restart attempts per agent
- 5-second delay between restarts
- Logs all restart attempts

### Manual Agent Control

```bash
# Stop specific agent
node monitoring/coordination-hub.js stop performance-monitor

# Restart agent
node monitoring/coordination-hub.js restart error-tracker

# View agent logs
node monitoring/coordination-hub.js logs security-monitor

# Check overall status
node monitoring/coordination-hub.js status
```

## Performance Impact

The monitoring system is designed for minimal performance impact:

- **CPU Usage:** <1% average
- **Memory Usage:** <200MB total for all agents
- **Disk I/O:** Minimal, with batched writes
- **Network:** No external calls (local monitoring only)

## Integration

### With Existing QA Systems

The monitoring system integrates with existing QA agents:

```bash
# Run both QA and monitoring
npm run qa:auth &
npm run monitor:security &
```

### With Development Workflow

```bash
# Development with monitoring
npm run dev &
npm run monitor:minimal &
```

### With Production Deployment

```bash
# Production with full monitoring
npm run start &
npm run monitor:full &
```

## API Integration

For external monitoring tools, reports can be accessed via:

```javascript
// Read latest health report
const fs = require('fs');
const report = JSON.parse(fs.readFileSync(
  'monitoring/reports/consolidated-2025-01-25.json'
));

console.log('System Status:', report.system_overview.overall_status);
```

## Future Enhancements

- **Webhooks:** Send alerts to Slack/Discord/Email
- **Metrics API:** REST API for external monitoring tools
- **Dashboard:** Web-based monitoring dashboard
- **Alerting Rules:** Configurable alert conditions
- **Metrics Retention:** Long-term metrics storage
- **Distributed Monitoring:** Multi-server monitoring

## Support

For monitoring system issues:

1. Check `monitoring/logs/` for error details
2. Run `npm run monitor:status` for system status
3. Review configuration in monitoring agent files
4. Restart monitoring with `npm run monitor:full`

The System Health Oversight Agent ensures your Zignal platform operates reliably with comprehensive monitoring, early warning detection, and automated recovery procedures.