/**
 * Core Rate Limiting Engine
 * Comprehensive rate limiting with multiple algorithms and security features
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  RATE_LIMIT_CONFIG, 
  RATE_LIMIT_HEADERS, 
  RATE_LIMIT_CODES,
  getRateLimitRule,
  isWhitelistedIP,
  isWhitelistedUserAgent,
  isHoneypotPath,
  detectBot,
  validateRateLimitConfig
} from './rate-limit-config';
import { createRateLimitDAO, RateLimitDAO } from './rate-limit-storage';
import { 
  extractClientIP, 
  analyzeIP, 
  generateIPRateLimitKey, 
  generateUserRateLimitKey,
  getThreatRateLimitMultiplier,
  shouldApplyGeoRateLimit,
  anonymizeIP,
  IPInfo
} from './ip-utils';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
  code?: string;
  response?: NextResponse;
}

export interface RateLimitRequest {
  ip: string;
  userId?: string;
  endpoint: string;
  method: string;
  userAgent?: string;
  headers: Record<string, string | null>;
}

/**
 * Main Rate Limiter Class
 */
export class RateLimiter {
  private dao: RateLimitDAO | null = null;
  private initialized = false;
  
  constructor() {
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Validate configuration
      const configValidation = validateRateLimitConfig();
      if (!configValidation.valid) {
        console.error('Rate limiter configuration errors:', configValidation.errors);
        throw new Error('Invalid rate limiter configuration');
      }
      
      if (configValidation.warnings.length > 0) {
        console.warn('Rate limiter configuration warnings:', configValidation.warnings);
      }
      
      // Initialize storage
      this.dao = await createRateLimitDAO();
      this.initialized = true;
      
      if (RATE_LIMIT_CONFIG.debug) {
        console.log('✅ Rate limiter initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize rate limiter:', error);
      throw error;
    }
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.dao) {
      await this.initialize();
    }
  }
  
  /**
   * Check rate limit for a request
   */
  async checkRateLimit(request: NextRequest, userId?: string): Promise<RateLimitResult> {
    try {
      await this.ensureInitialized();
      
      const startTime = Date.now();
      
      // Extract request information
      const ipInfo = extractClientIP(request);
      const rateLimitRequest: RateLimitRequest = {
        ip: ipInfo.ip,
        userId,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        headers: {
          'user-agent': request.headers.get('user-agent'),
          'referer': request.headers.get('referer'),
          'origin': request.headers.get('origin')
        }
      };
      
      // Early checks and bypasses
      const earlyResult = await this.performEarlyChecks(rateLimitRequest, ipInfo);
      if (earlyResult) {
        return earlyResult;
      }
      
      // Get rate limit rule for this endpoint
      const rule = getRateLimitRule(rateLimitRequest.endpoint, rateLimitRequest.method);
      
      // Apply IP-based rate limiting
      const ipResult = await this.checkIPRateLimit(rateLimitRequest, rule, ipInfo);
      if (!ipResult.allowed) {
        this.logRateLimitEvent('ip_rate_limited', rateLimitRequest, ipResult);
        return ipResult;
      }
      
      // Apply user-based rate limiting (if authenticated)
      if (userId) {
        const userResult = await this.checkUserRateLimit(rateLimitRequest, rule);
        if (!userResult.allowed) {
          this.logRateLimitEvent('user_rate_limited', rateLimitRequest, userResult);
          return userResult;
        }
      }
      
      // Apply global rate limiting
      const globalResult = await this.checkGlobalRateLimit(rateLimitRequest, ipInfo);
      if (!globalResult.allowed) {
        this.logRateLimitEvent('global_rate_limited', rateLimitRequest, globalResult);
        return globalResult;
      }
      
      // Log performance metrics
      const duration = Date.now() - startTime;
      if (duration > 50) { // Log slow rate limit checks
        this.logSecurityEvent('rate_limit_slow_check', {
          duration,
          endpoint: rateLimitRequest.endpoint,
          ip: anonymizeIP(rateLimitRequest.ip)
        });
      }
      
      // Request is allowed
      return {
        allowed: true,
        limit: rule.requests,
        remaining: Math.max(0, rule.requests - ipResult.remaining),
        resetTime: ipResult.resetTime
      };
      
    } catch (error) {
      console.error('Rate limiter error:', error);
      
      // Fail securely - allow request but log error
      this.logSecurityEvent('rate_limiter_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: request.nextUrl.pathname,
        ip: anonymizeIP(extractClientIP(request).ip)
      });
      
      return {
        allowed: true,
        limit: 0,
        remaining: 0,
        resetTime: Date.now() + 60000 // 1 minute
      };
    }
  }
  
  /**
   * Perform early security checks and bypasses
   */
  private async performEarlyChecks(
    request: RateLimitRequest, 
    ipInfo: IPInfo
  ): Promise<RateLimitResult | null> {
    if (!this.dao) throw new Error('Rate limiter not initialized');
    
    // Check if rate limiting is disabled
    if (!RATE_LIMIT_CONFIG.enabled) {
      return {
        allowed: true,
        limit: Number.MAX_SAFE_INTEGER,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: Date.now() + 3600000
      };
    }
    
    // Check IP whitelist
    if (isWhitelistedIP(request.ip)) {
      if (RATE_LIMIT_CONFIG.debug) {
        console.log(`IP ${request.ip} is whitelisted`);
      }
      return {
        allowed: true,
        limit: Number.MAX_SAFE_INTEGER,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: Date.now() + 3600000
      };
    }
    
    // Check User-Agent whitelist
    if (request.userAgent && isWhitelistedUserAgent(request.userAgent)) {
      if (RATE_LIMIT_CONFIG.debug) {
        console.log(`User-Agent is whitelisted: ${request.userAgent}`);
      }
      return {
        allowed: true,
        limit: Number.MAX_SAFE_INTEGER,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: Date.now() + 3600000
      };
    }
    
    // Check if IP is blocked
    const blockStatus = await this.dao.isBlocked(generateIPRateLimitKey(ipInfo, 'block'));
    if (blockStatus.blocked) {
      this.logRateLimitEvent('ip_blocked', request, {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: blockStatus.expiresAt || Date.now() + 3600000,
        reason: blockStatus.reason,
        code: RATE_LIMIT_CODES.IP_BLOCKED
      });
      
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: blockStatus.expiresAt || Date.now() + 3600000,
        retryAfter: Math.ceil(((blockStatus.expiresAt || Date.now() + 3600000) - Date.now()) / 1000),
        reason: blockStatus.reason,
        code: RATE_LIMIT_CODES.IP_BLOCKED,
        response: this.createRateLimitResponse({
          allowed: false,
          limit: 0,
          remaining: 0,
          resetTime: blockStatus.expiresAt || Date.now() + 3600000,
          reason: blockStatus.reason,
          code: RATE_LIMIT_CODES.IP_BLOCKED
        })
      };
    }
    
    // Honeypot detection
    if (RATE_LIMIT_CONFIG.advanced.honeypot && isHoneypotPath(request.endpoint)) {
      await this.dao.markHoneypotTrigger(request.ip);
      await this.dao.blockKey(
        generateIPRateLimitKey(ipInfo, 'honeypot'),
        RATE_LIMIT_CONFIG.penalties.autoBlockDuration,
        'Honeypot triggered'
      );
      
      this.logRateLimitEvent('honeypot_triggered', request, {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: Date.now() + RATE_LIMIT_CONFIG.penalties.autoBlockDuration * 1000,
        reason: 'Honeypot triggered',
        code: RATE_LIMIT_CODES.HONEYPOT_TRIGGERED
      });
      
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: Date.now() + RATE_LIMIT_CONFIG.penalties.autoBlockDuration * 1000,
        retryAfter: RATE_LIMIT_CONFIG.penalties.autoBlockDuration,
        reason: 'Access denied',
        code: RATE_LIMIT_CODES.HONEYPOT_TRIGGERED,
        response: this.createRateLimitResponse({
          allowed: false,
          limit: 0,
          remaining: 0,
          resetTime: Date.now() + RATE_LIMIT_CONFIG.penalties.autoBlockDuration * 1000,
          reason: 'Access denied',
          code: RATE_LIMIT_CODES.HONEYPOT_TRIGGERED
        }, 403)
      };
    }
    
    // Bot detection
    if (request.userAgent && detectBot(request.userAgent, request.headers)) {
      const botKey = generateIPRateLimitKey(ipInfo, 'bot');
      const botRequests = await this.dao.incrementRequestCount(botKey, 300); // 5 minute window
      
      if (botRequests > 10) { // Very restrictive for bots
        return {
          allowed: false,
          limit: 10,
          remaining: 0,
          resetTime: Date.now() + 300000,
          retryAfter: 300,
          reason: 'Bot detected - rate limited',
          code: RATE_LIMIT_CODES.BOT_DETECTED,
          response: this.createRateLimitResponse({
            allowed: false,
            limit: 10,
            remaining: 0,
            resetTime: Date.now() + 300000,
            reason: 'Rate limited',
            code: RATE_LIMIT_CODES.BOT_DETECTED
          }, 429)
        };
      }
    }
    
    return null; // Continue with normal rate limiting
  }
  
  /**
   * Check IP-based rate limiting
   */
  private async checkIPRateLimit(
    request: RateLimitRequest,
    rule: any,
    ipInfo: IPInfo
  ): Promise<RateLimitResult> {
    if (!this.dao) throw new Error('Rate limiter not initialized');
    
    // Analyze IP for enhanced information
    const analyzedIP = await analyzeIP(ipInfo);
    
    // Apply threat-based multiplier
    const threatMultiplier = getThreatRateLimitMultiplier(analyzedIP.geolocation?.threat);
    const adjustedLimit = Math.floor(rule.requests * threatMultiplier);
    const adjustedWindow = rule.window;
    
    // Apply geographic restrictions
    if (shouldApplyGeoRateLimit(analyzedIP.geolocation)) {
      const geoLimit = Math.floor(adjustedLimit * 0.5); // 50% reduction for restricted regions
      rule = { ...rule, requests: geoLimit };
    }
    
    const ipKey = generateIPRateLimitKey(ipInfo);
    
    // Check for existing penalties
    const penalty = await this.dao.getPenalty(ipKey);
    const effectiveWindow = adjustedWindow + penalty;
    
    // Get current request count
    const requestCount = await this.dao.incrementRequestCount(ipKey, effectiveWindow);
    const remaining = Math.max(0, adjustedLimit - requestCount);
    const resetTime = Date.now() + (effectiveWindow * 1000);
    
    // Check if limit exceeded
    if (requestCount > adjustedLimit) {
      // Record violation
      const violationCount = await this.dao.recordViolation(ipKey);
      
      // Apply progressive penalty
      if (RATE_LIMIT_CONFIG.advanced.progressivePenalty) {
        const penaltyIncrease = RATE_LIMIT_CONFIG.penalties.firstViolation * 
                               Math.pow(RATE_LIMIT_CONFIG.penalties.repeatViolation, violationCount - 1);
        await this.dao.addPenalty(ipKey, penaltyIncrease);
      }
      
      return {
        allowed: false,
        limit: adjustedLimit,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(effectiveWindow),
        reason: 'IP rate limit exceeded',
        code: RATE_LIMIT_CODES.RATE_LIMITED,
        response: this.createRateLimitResponse({
          allowed: false,
          limit: adjustedLimit,
          remaining: 0,
          resetTime,
          reason: 'Rate limit exceeded',
          code: RATE_LIMIT_CODES.RATE_LIMITED
        })
      };
    }
    
    return {
      allowed: true,
      limit: adjustedLimit,
      remaining,
      resetTime
    };
  }
  
  /**
   * Check user-based rate limiting
   */
  private async checkUserRateLimit(
    request: RateLimitRequest,
    rule: any
  ): Promise<RateLimitResult> {
    if (!this.dao || !request.userId) {
      return {
        allowed: true,
        limit: rule.requests,
        remaining: rule.requests,
        resetTime: Date.now() + rule.window * 1000
      };
    }
    
    const userKey = generateUserRateLimitKey(request.userId);
    const userRule = RATE_LIMIT_CONFIG.globalRules.perUser;
    
    const requestCount = await this.dao.incrementRequestCount(userKey, userRule.window);
    const remaining = Math.max(0, userRule.requests - requestCount);
    const resetTime = Date.now() + (userRule.window * 1000);
    
    if (requestCount > userRule.requests) {
      await this.dao.recordViolation(userKey);
      
      return {
        allowed: false,
        limit: userRule.requests,
        remaining: 0,
        resetTime,
        retryAfter: userRule.window,
        reason: 'User rate limit exceeded',
        code: RATE_LIMIT_CODES.USER_BLOCKED,
        response: this.createRateLimitResponse({
          allowed: false,
          limit: userRule.requests,
          remaining: 0,
          resetTime,
          reason: 'Rate limit exceeded',
          code: RATE_LIMIT_CODES.USER_BLOCKED
        })
      };
    }
    
    return {
      allowed: true,
      limit: userRule.requests,
      remaining,
      resetTime
    };
  }
  
  /**
   * Check global rate limiting
   */
  private async checkGlobalRateLimit(
    request: RateLimitRequest,
    ipInfo: IPInfo
  ): Promise<RateLimitResult> {
    if (!this.dao) throw new Error('Rate limiter not initialized');
    
    const globalRule = RATE_LIMIT_CONFIG.globalRules.perIP;
    const globalKey = generateIPRateLimitKey(ipInfo, 'global');
    
    const requestCount = await this.dao.incrementRequestCount(globalKey, globalRule.window);
    const remaining = Math.max(0, globalRule.requests - requestCount);
    const resetTime = Date.now() + (globalRule.window * 1000);
    
    // Check for suspicious rapid-fire requests
    const suspiciousKey = generateIPRateLimitKey(ipInfo, 'suspicious');
    const recentRequests = await this.dao.incrementRequestCount(suspiciousKey, 10); // 10 second window
    
    if (recentRequests > RATE_LIMIT_CONFIG.security.suspiciousThreshold) {
      await this.dao.markSuspicious(request.ip, 'Rapid-fire requests detected');
      
      // Apply temporary penalty
      await this.dao.addPenalty(generateIPRateLimitKey(ipInfo), 300); // 5 minute penalty
    }
    
    if (requestCount > globalRule.requests) {
      return {
        allowed: false,
        limit: globalRule.requests,
        remaining: 0,
        resetTime,
        retryAfter: globalRule.window,
        reason: 'Global rate limit exceeded',
        code: RATE_LIMIT_CODES.RATE_LIMITED,
        response: this.createRateLimitResponse({
          allowed: false,
          limit: globalRule.requests,
          remaining: 0,
          resetTime,
          reason: 'Rate limit exceeded',
          code: RATE_LIMIT_CODES.RATE_LIMITED
        })
      };
    }
    
    return {
      allowed: true,
      limit: globalRule.requests,
      remaining,
      resetTime
    };
  }
  
  /**
   * Create rate limit response with proper headers
   */
  private createRateLimitResponse(result: RateLimitResult, status: number = 429): NextResponse {
    const response = NextResponse.json(
      {
        error: result.reason || 'Rate limit exceeded',
        code: result.code || RATE_LIMIT_CODES.RATE_LIMITED,
        retryAfter: result.retryAfter
      },
      { status }
    );
    
    // Add rate limit headers
    response.headers.set(RATE_LIMIT_HEADERS.LIMIT, result.limit.toString());
    response.headers.set(RATE_LIMIT_HEADERS.REMAINING, result.remaining.toString());
    response.headers.set(RATE_LIMIT_HEADERS.RESET, Math.ceil(result.resetTime / 1000).toString());
    
    if (result.retryAfter) {
      response.headers.set(RATE_LIMIT_HEADERS.RETRY_AFTER, result.retryAfter.toString());
    }
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  }
  
  /**
   * Log rate limiting events
   */
  private logRateLimitEvent(
    event: string, 
    request: RateLimitRequest, 
    result: RateLimitResult
  ): void {
    this.logSecurityEvent(event, {
      ip: anonymizeIP(request.ip),
      endpoint: request.endpoint,
      method: request.method,
      userAgent: request.userAgent?.substring(0, 100),
      userId: request.userId,
      limit: result.limit,
      remaining: result.remaining,
      reason: result.reason,
      code: result.code
    });
  }
  
  /**
   * Log security events
   */
  private logSecurityEvent(event: string, data: any): void {
    if (RATE_LIMIT_CONFIG.debug) {
      console.log(`[RATE_LIMIT] ${event}:`, data);
    }
  }
  
  /**
   * Admin function to clear rate limits for an IP or user
   */
  async clearRateLimit(identifier: string, type: 'ip' | 'user' = 'ip'): Promise<void> {
    await this.ensureInitialized();
    if (!this.dao) return;
    
    const key = type === 'ip' ? 
      `ip:${identifier}` : 
      generateUserRateLimitKey(identifier);
    
    await this.dao.clearKey(key);
    
    this.logSecurityEvent('rate_limit_cleared', {
      identifier: type === 'ip' ? anonymizeIP(identifier) : identifier,
      type
    });
  }
  
  /**
   * Admin function to get rate limit status
   */
  async getRateLimitStatus(identifier: string, type: 'ip' | 'user' = 'ip'): Promise<{
    requestCount: number;
    penalty: number;
    violations: number;
    blocked: boolean;
    blockReason?: string;
  }> {
    await this.ensureInitialized();
    if (!this.dao) {
      return {
        requestCount: 0,
        penalty: 0,
        violations: 0,
        blocked: false
      };
    }
    
    const key = type === 'ip' ? `ip:${identifier}` : generateUserRateLimitKey(identifier);
    
    const [requestCount, penalty, violations, blockStatus] = await Promise.all([
      this.dao.getRequestCount(key),
      this.dao.getPenalty(key),
      this.dao.getViolationCount(key),
      this.dao.isBlocked(key)
    ]);
    
    return {
      requestCount,
      penalty,
      violations,
      blocked: blockStatus.blocked,
      blockReason: blockStatus.reason
    };
  }
}

// Global rate limiter instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get the global rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Convenience function for rate limiting requests
 */
export async function applyRateLimit(
  request: NextRequest, 
  userId?: string
): Promise<RateLimitResult> {
  const rateLimiter = getRateLimiter();
  return await rateLimiter.checkRateLimit(request, userId);
}