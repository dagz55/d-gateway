/**
 * Rate Limiting Configuration
 * Comprehensive configuration for rate limiting rules and policies
 */

export interface RateLimitRule {
  requests: number;
  window: number; // in seconds
  burstLimit?: number; // additional burst capacity
  resetTime?: number; // custom reset time
}

export interface RateLimitConfig {
  enabled: boolean;
  storage: 'memory' | 'redis';
  debug: boolean;
  defaultRule: RateLimitRule;
  endpointRules: Record<string, RateLimitRule>;
  globalRules: {
    perIP: RateLimitRule;
    perUser: RateLimitRule;
  };
  advanced: {
    slidingWindow: boolean;
    progressivePenalty: boolean;
    geoLocation: boolean;
    honeypot: boolean;
    autoBlocking: boolean;
  };
  whitelist: {
    ips: string[];
    userAgents: string[];
    adminBypass: boolean;
  };
  penalties: {
    firstViolation: number; // seconds to add to window
    repeatViolation: number; // multiplier for repeat offenses
    maxPenalty: number; // maximum penalty in seconds
    autoBlockThreshold: number; // violations before auto-block
    autoBlockDuration: number; // auto-block duration in seconds
  };
  security: {
    maxConcurrentRequests: number;
    suspiciousThreshold: number;
    honeypotPaths: string[];
    botDetection: boolean;
  };
}

// Default rate limiting configuration
export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
  storage: (process.env.RATE_LIMIT_STORAGE as 'memory' | 'redis') || 'memory',
  debug: process.env.NODE_ENV === 'development',
  
  // Default rule for unspecified endpoints
  defaultRule: {
    requests: 100,
    window: 60, // 1 minute
    burstLimit: 20
  },
  
  // Authentication endpoint specific rules
  endpointRules: {
    '/api/auth/workos/login': {
      requests: 5,
      window: 900, // 15 minutes
      burstLimit: 2
    },
    '/api/auth/workos/callback': {
      requests: 10,
      window: 300, // 5 minutes
      burstLimit: 3
    },
    '/api/auth/workos/me': {
      requests: 100,
      window: 60, // 1 minute
      burstLimit: 20
    },
    '/api/auth/workos/logout': {
      requests: 10,
      window: 300, // 5 minutes
      burstLimit: 2
    },
    '/api/auth/workos/profile': {
      requests: 50,
      window: 300, // 5 minutes
      burstLimit: 10
    },
    '/api/auth/supabase/me': {
      requests: 100,
      window: 60, // 1 minute
      burstLimit: 20
    }
  },
  
  // Global rate limiting rules
  globalRules: {
    perIP: {
      requests: 1000,
      window: 3600, // 1 hour
      burstLimit: 50
    },
    perUser: {
      requests: 5000,
      window: 3600, // 1 hour
      burstLimit: 100
    }
  },
  
  // Advanced features
  advanced: {
    slidingWindow: true,
    progressivePenalty: true,
    geoLocation: false, // Enable for production with IP geolocation service
    honeypot: true,
    autoBlocking: true
  },
  
  // Whitelist configuration
  whitelist: {
    ips: process.env.RATE_LIMIT_WHITELIST_IPS?.split(',') || [],
    userAgents: process.env.RATE_LIMIT_WHITELIST_UA?.split(',') || [],
    adminBypass: true
  },
  
  // Progressive penalty system
  penalties: {
    firstViolation: 300, // 5 minutes additional delay
    repeatViolation: 2, // double the penalty each time
    maxPenalty: 3600, // maximum 1 hour penalty
    autoBlockThreshold: 5, // block after 5 violations
    autoBlockDuration: 1800 // 30 minutes auto-block
  },
  
  // Security features
  security: {
    maxConcurrentRequests: 50,
    suspiciousThreshold: 10, // requests in 10 seconds
    honeypotPaths: [
      '/admin',
      '/wp-admin',
      '/.env',
      '/config',
      '/api/admin',
      '/database',
      '/phpmyadmin'
    ],
    botDetection: true
  }
};

// Rate limit headers configuration
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After',
  WINDOW: 'X-RateLimit-Window'
} as const;

// Rate limit response codes
export const RATE_LIMIT_CODES = {
  RATE_LIMITED: 'RATE_LIMITED',
  IP_BLOCKED: 'IP_BLOCKED',
  USER_BLOCKED: 'USER_BLOCKED',
  HONEYPOT_TRIGGERED: 'HONEYPOT_TRIGGERED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  BOT_DETECTED: 'BOT_DETECTED'
} as const;

// Geographic rate limiting rules (if geolocation is enabled)
export const GEO_RATE_LIMITS: Record<string, Partial<RateLimitRule>> = {
  'US': { requests: 1000, window: 3600 },
  'CA': { requests: 1000, window: 3600 },
  'GB': { requests: 800, window: 3600 },
  'EU': { requests: 800, window: 3600 },
  'default': { requests: 500, window: 3600 } // More restrictive for other regions
};

// Bot detection patterns
export const BOT_PATTERNS = {
  userAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /requests/i,
    /http/i,
    /headless/i
  ],
  suspiciousHeaders: [
    'x-requested-with',
    'x-forwarded-proto',
    'x-original-url'
  ]
};

// Rate limiting storage keys
export const STORAGE_KEYS = {
  REQUEST_COUNT: (key: string) => `rate_limit:count:${key}`,
  PENALTY: (key: string) => `rate_limit:penalty:${key}`,
  BLOCK: (key: string) => `rate_limit:block:${key}`,
  VIOLATIONS: (key: string) => `rate_limit:violations:${key}`,
  SLIDING_WINDOW: (key: string) => `rate_limit:window:${key}`,
  HONEYPOT: (ip: string) => `rate_limit:honeypot:${ip}`,
  SUSPICIOUS: (ip: string) => `rate_limit:suspicious:${ip}`
} as const;

/**
 * Validate rate limiting configuration
 */
export function validateRateLimitConfig(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check if configuration values are reasonable
  Object.entries(RATE_LIMIT_CONFIG.endpointRules).forEach(([endpoint, rule]) => {
    if (rule.requests <= 0) {
      errors.push(`Invalid request count for endpoint ${endpoint}: ${rule.requests}`);
    }
    if (rule.window <= 0) {
      errors.push(`Invalid window for endpoint ${endpoint}: ${rule.window}`);
    }
    if (rule.burstLimit && rule.burstLimit > rule.requests) {
      warnings.push(`Burst limit exceeds request limit for ${endpoint}`);
    }
  });
  
  // Check Redis configuration if using Redis storage
  if (RATE_LIMIT_CONFIG.storage === 'redis') {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      errors.push('Redis storage selected but no Redis configuration found');
    }
  }
  
  // Validate penalty configuration
  if (RATE_LIMIT_CONFIG.penalties.autoBlockThreshold <= 0) {
    errors.push('Auto-block threshold must be positive');
  }
  
  if (RATE_LIMIT_CONFIG.penalties.maxPenalty <= 0) {
    errors.push('Maximum penalty must be positive');
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Get rate limit rule for a specific endpoint
 */
export function getRateLimitRule(path: string, method: string = 'GET'): RateLimitRule {
  // Check for exact path match first
  const exactMatch = RATE_LIMIT_CONFIG.endpointRules[path];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Check for pattern matches
  const authPaths = Object.keys(RATE_LIMIT_CONFIG.endpointRules);
  const matchingPath = authPaths.find(authPath => {
    // Check if the path starts with the auth path
    return path.startsWith(authPath) || path.includes(authPath);
  });
  
  if (matchingPath) {
    return RATE_LIMIT_CONFIG.endpointRules[matchingPath];
  }
  
  // Return default rule with method-specific adjustments
  const defaultRule = { ...RATE_LIMIT_CONFIG.defaultRule };
  
  // Apply stricter limits for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    defaultRule.requests = Math.floor(defaultRule.requests * 0.5);
    defaultRule.burstLimit = Math.floor((defaultRule.burstLimit || 0) * 0.5);
  }
  
  return defaultRule;
}

/**
 * Check if IP is whitelisted
 */
export function isWhitelistedIP(ip: string): boolean {
  return RATE_LIMIT_CONFIG.whitelist.ips.includes(ip) ||
         RATE_LIMIT_CONFIG.whitelist.ips.includes('*');
}

/**
 * Check if User-Agent is whitelisted
 */
export function isWhitelistedUserAgent(userAgent: string): boolean {
  return RATE_LIMIT_CONFIG.whitelist.userAgents.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Check if path is a honeypot
 */
export function isHoneypotPath(path: string): boolean {
  return RATE_LIMIT_CONFIG.security.honeypotPaths.some(honeypotPath =>
    path.startsWith(honeypotPath) || path.includes(honeypotPath)
  );
}

/**
 * Detect if request is from a bot
 */
export function detectBot(userAgent: string, headers: Record<string, string | null>): boolean {
  if (!RATE_LIMIT_CONFIG.security.botDetection) {
    return false;
  }
  
  // Check user agent patterns
  const isBotUA = BOT_PATTERNS.userAgents.some(pattern => 
    pattern.test(userAgent)
  );
  
  // Check for suspicious headers
  const hasSuspiciousHeaders = BOT_PATTERNS.suspiciousHeaders.some(header =>
    headers[header] !== null && headers[header] !== undefined
  );
  
  return isBotUA || hasSuspiciousHeaders;
}