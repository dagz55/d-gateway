const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const path = require('path');

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'https://zignal-login.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// MCP Service Registry with stdio communication
const mcpServices = {
  supabase: {
    command: 'npx',
    args: ['@supabase/mcp-server-supabase@latest', '--read-only', '--project-ref=elnntdfdlojxpcjiyehe'],
    description: 'Supabase database and documentation access',
    status: 'stopped',
    process: null
  },
  filesystem: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', process.cwd()],
    description: 'Local filesystem access',
    status: 'stopped',
    process: null
  },
  memory: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-memory'],
    description: 'Memory storage and retrieval',
    status: 'stopped',
    process: null
  },
  puppeteer: {
    command: 'npx',
    args: ['mcp-server-puppeteer'],
    description: 'Browser automation and web scraping',
    status: 'stopped',
    process: null
  },
  context7: {
    command: 'npx',
    args: ['@upstash/context7-mcp@latest'],
    description: 'Context and documentation search',
    status: 'stopped',
    process: null
  },
  reactbits: {
    command: 'npx',
    args: ['reactbits-dev-mcp-server'],
    description: 'React component library access',
    status: 'stopped',
    process: null
  }
};

// Start an MCP service
const startMCPService = (serviceName) => {
  const service = mcpServices[serviceName];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  if (service.process) {
    logger.warn(`Service ${serviceName} is already running`);
    return;
  }

  logger.info(`Starting MCP service: ${serviceName}`);
  
  const childProcess = spawn(service.command, service.args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' }
  });

  service.process = childProcess;
  service.status = 'starting';

  childProcess.on('spawn', () => {
    logger.info(`MCP service ${serviceName} spawned successfully`);
    service.status = 'running';
  });

  childProcess.on('error', (error) => {
    logger.error(`MCP service ${serviceName} error:`, error);
    service.status = 'error';
    service.process = null;
  });

  childProcess.on('exit', (code, signal) => {
    logger.warn(`MCP service ${serviceName} exited with code ${code}, signal ${signal}`);
    service.status = 'stopped';
    service.process = null;
  });

  // Handle stdout/stderr
  childProcess.stdout.on('data', (data) => {
    logger.debug(`${serviceName} stdout:`, data.toString().trim());
  });

  childProcess.stderr.on('data', (data) => {
    logger.debug(`${serviceName} stderr:`, data.toString().trim());
  });

  return childProcess;
};

// Stop an MCP service
const stopMCPService = (serviceName) => {
  const service = mcpServices[serviceName];
  if (!service || !service.process) {
    logger.warn(`Service ${serviceName} is not running`);
    return;
  }

  logger.info(`Stopping MCP service: ${serviceName}`);
  service.process.kill('SIGTERM');
  service.status = 'stopping';
};

// Send MCP request to service
const sendMCPRequest = async (serviceName, request) => {
  const service = mcpServices[serviceName];
  if (!service || !service.process || service.status !== 'running') {
    throw new Error(`Service ${serviceName} is not available`);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MCP request timeout'));
    }, 10000);

    const handleResponse = (data) => {
      clearTimeout(timeout);
      try {
        const response = JSON.parse(data.toString());
        resolve(response);
      } catch (error) {
        reject(new Error('Invalid MCP response format'));
      }
    };

    service.process.stdout.once('data', handleResponse);
    service.process.stdin.write(JSON.stringify(request) + '\n');
  });
};

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  const serviceStatuses = {};
  Object.keys(mcpServices).forEach(name => {
    serviceStatuses[name] = mcpServices[name].status;
  });

  const healthStatus = {
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceStatuses,
    uptime: process.uptime(),
    runningServices: Object.values(mcpServices).filter(s => s.status === 'running').length,
    totalServices: Object.keys(mcpServices).length
  };
  
  res.json(healthStatus);
});

// Service discovery endpoint
app.get('/services', (req, res) => {
  const services = Object.entries(mcpServices).map(([name, service]) => ({
    name,
    description: service.description,
    status: service.status,
    endpoint: `/mcp/${name}`,
    command: `${service.command} ${service.args.join(' ')}`
  }));
  
  res.json({ services });
});

// Start service endpoint
app.post('/services/:serviceName/start', (req, res) => {
  const { serviceName } = req.params;
  
  try {
    startMCPService(serviceName);
    res.json({ 
      success: true, 
      message: `Service ${serviceName} starting`,
      status: mcpServices[serviceName].status
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Stop service endpoint
app.post('/services/:serviceName/stop', (req, res) => {
  const { serviceName } = req.params;
  
  try {
    stopMCPService(serviceName);
    res.json({ 
      success: true, 
      message: `Service ${serviceName} stopping`,
      status: mcpServices[serviceName].status
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// NextJS MCP proxy endpoint with OAuth validation (must come before /mcp/:serviceName)
app.post('/mcp/nextjs', async (req, res) => {
  const { serviceName } = req.query;
  const mcpRequest = req.body;
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  // Validate OAuth token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Bearer token required'
    });
  }
  
  const token = authHeader.substring(7);
  
  // Basic token validation (in production, validate with Clerk)
  if (!token || token.length < 10) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Invalid OAuth token format'
    });
  }
  
  // Log the request for monitoring
  logger.info('NextJS MCP request', {
    serviceName: serviceName || 'default',
    userId,
    userEmail,
    userRole,
    method: mcpRequest.method,
    requestId: mcpRequest.id,
    timestamp: new Date().toISOString()
  });
  
  // Determine service name
  const targetService = serviceName || 'filesystem';
  
  // Check if service exists
  if (!mcpServices[targetService]) {
    return res.status(400).json({
      success: false,
      error: 'Service not found',
      message: `Service '${targetService}' is not available`,
      availableServices: Object.keys(mcpServices)
    });
  }
  
  try {
    const response = await sendMCPRequest(targetService, mcpRequest);
    
    // Add metadata to response
    const enhancedResponse = {
      ...response,
      metadata: {
        serviceName: targetService,
        userId,
        userEmail,
        userRole,
        requestId: mcpRequest.id,
        responseId: response.id,
        timestamp: new Date().toISOString(),
        gatewayVersion: '1.0.0'
      }
    };
    
    res.json(enhancedResponse);
  } catch (error) {
    logger.error(`NextJS MCP request failed for ${targetService}:`, error);
    res.status(502).json({
      success: false,
      error: 'MCP request failed',
      service: targetService,
      message: error.message,
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    });
  }
});

// MCP request proxy endpoint (general)
app.post('/mcp/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const mcpRequest = req.body;
  
  try {
    const response = await sendMCPRequest(serviceName, mcpRequest);
    res.json(response);
  } catch (error) {
    logger.error(`MCP request failed for ${serviceName}:`, error);
    res.status(502).json({
      error: 'MCP request failed',
      service: serviceName,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start all services endpoint
app.post('/services/start-all', (req, res) => {
  const results = {};
  
  Object.keys(mcpServices).forEach(serviceName => {
    try {
      startMCPService(serviceName);
      results[serviceName] = 'starting';
    } catch (error) {
      results[serviceName] = `error: ${error.message}`;
    }
  });
  
  res.json({ 
    success: true, 
    message: 'Starting all services',
    results 
  });
});

// Stop all services endpoint
app.post('/services/stop-all', (req, res) => {
  const results = {};
  
  Object.keys(mcpServices).forEach(serviceName => {
    try {
      stopMCPService(serviceName);
      results[serviceName] = 'stopping';
    } catch (error) {
      results[serviceName] = `error: ${error.message}`;
    }
  });
  
  res.json({ 
    success: true, 
    message: 'Stopping all services',
    results 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal gateway error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /services', 
      'POST /services/:name/start',
      'POST /services/:name/stop',
      'POST /services/start-all',
      'POST /services/stop-all',
      'POST /mcp/:name'
    ],
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down MCP Gateway...');
  
  // Stop all MCP services
  Object.keys(mcpServices).forEach(serviceName => {
    try {
      stopMCPService(serviceName);
    } catch (error) {
      logger.error(`Error stopping ${serviceName}:`, error);
    }
  });
  
  // Close server
  server.close(() => {
    logger.info('MCP Gateway shut down complete');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 MCP Gateway running on port ${PORT}`);
  logger.info(`📋 Available services: ${Object.keys(mcpServices).join(', ')}`);
  logger.info(`🔗 Gateway URL: http://localhost:${PORT}`);
  logger.info(`💡 Management endpoints:`);
  logger.info(`   📊 Health: http://localhost:${PORT}/health`);
  logger.info(`   🔍 Services: http://localhost:${PORT}/services`);
  logger.info(`   ▶️  Start all: POST http://localhost:${PORT}/services/start-all`);
  logger.info(`   ⏹️  Stop all: POST http://localhost:${PORT}/services/stop-all`);
});

module.exports = { app, server };
