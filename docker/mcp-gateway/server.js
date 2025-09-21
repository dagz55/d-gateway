const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const cron = require('node-cron');

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

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// MCP Service Registry
const mcpServices = {
  supabase: {
    target: 'http://mcp-supabase:3000',
    changeOrigin: true,
    timeout: 30000,
    retries: 3
  },
  filesystem: {
    target: 'http://mcp-filesystem:3000',
    changeOrigin: true,
    timeout: 10000,
    retries: 2
  },
  memory: {
    target: 'http://mcp-memory:3000',
    changeOrigin: true,
    timeout: 5000,
    retries: 2
  },
  puppeteer: {
    target: 'http://mcp-puppeteer:3000',
    changeOrigin: true,
    timeout: 60000,
    retries: 1
  },
  context7: {
    target: 'http://mcp-context7:3000',
    changeOrigin: true,
    timeout: 15000,
    retries: 2
  },
  reactbits: {
    target: 'http://mcp-reactbits:3000',
    changeOrigin: true,
    timeout: 10000,
    retries: 2
  },
  'browser-tools': {
    target: 'http://mcp-browser-tools:3000',
    changeOrigin: true,
    timeout: 30000,
    retries: 2
  },
  tavily: {
    target: 'http://mcp-tavily:3000',
    changeOrigin: true,
    timeout: 15000,
    retries: 2
  }
};

// Service health tracking
const serviceHealth = {};

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus = {
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
    uptime: process.uptime()
  };
  
  res.json(healthStatus);
});

// Service discovery endpoint
app.get('/services', (req, res) => {
  const services = Object.keys(mcpServices).map(name => ({
    name,
    endpoint: `/mcp/${name}`,
    target: mcpServices[name].target,
    status: serviceHealth[name] || 'unknown'
  }));
  
  res.json({ services });
});

// Create proxies for each MCP service
Object.entries(mcpServices).forEach(([serviceName, config]) => {
  const proxyMiddleware = createProxyMiddleware({
    ...config,
    pathRewrite: {
      [`^/mcp/${serviceName}`]: ''
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      serviceHealth[serviceName] = 'error';
      res.status(502).json({
        error: 'Service unavailable',
        service: serviceName,
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying ${req.method} ${req.path} to ${serviceName}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      serviceHealth[serviceName] = proxyRes.statusCode < 400 ? 'healthy' : 'unhealthy';
    }
  });
  
  app.use(`/mcp/${serviceName}`, proxyMiddleware);
  logger.info(`Configured proxy for ${serviceName} -> ${config.target}`);
});

// Load balancer for multiple instances (future enhancement)
app.get('/mcp/balance/:service', (req, res) => {
  const { service } = req.params;
  
  if (!mcpServices[service]) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  // Simple round-robin would go here
  res.redirect(`/mcp/${service}${req.url.replace(`/mcp/balance/${service}`, '')}`);
});

// WebSocket proxy support (for real-time MCP services)
const server = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://zignal-login.vercel.app'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info('WebSocket client connected:', socket.id);
  
  socket.on('mcp-request', async (data) => {
    try {
      const { service, method, params } = data;
      
      if (!mcpServices[service]) {
        socket.emit('mcp-error', { error: 'Service not found', service });
        return;
      }
      
      // Forward request to appropriate MCP service
      // Implementation would depend on MCP protocol specifics
      socket.emit('mcp-response', { service, method, result: 'success' });
    } catch (error) {
      logger.error('WebSocket MCP request error:', error);
      socket.emit('mcp-error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected:', socket.id);
  });
});

// Service health monitoring cron job
cron.schedule('*/30 * * * * *', async () => {
  logger.debug('Running health checks for MCP services...');
  
  for (const [serviceName, config] of Object.entries(mcpServices)) {
    try {
      const response = await fetch(`${config.target}/health`, {
        timeout: 5000
      });
      serviceHealth[serviceName] = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      serviceHealth[serviceName] = 'error';
      logger.warn(`Health check failed for ${serviceName}:`, error.message);
    }
  }
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
    availableServices: Object.keys(mcpServices),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('MCP Gateway shut down complete');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 MCP Gateway running on port ${PORT}`);
  logger.info(`📋 Available services: ${Object.keys(mcpServices).join(', ')}`);
  logger.info(`🔗 Gateway URL: http://localhost:${PORT}`);
  logger.info(`💡 Service endpoints: /mcp/{service-name}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔍 Service discovery: http://localhost:${PORT}/services`);
});

module.exports = { app, server };
