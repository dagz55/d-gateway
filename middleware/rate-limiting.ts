/**
 * Rate Limiting Middleware
 * Integrates comprehensive rate limiting with Next.js middleware and security logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, getRateLimiter } from '@/lib/rate-limiter';
import { RATE_LIMIT_CONFIG, RATE_LIMIT_HEADERS } from '@/lib/rate-limit-config';
import { extractClientIP, anonymizeIP } from '@/lib/ip-utils';
import { logRateLimitEvent, logSecurityEvent } from '@/lib/security-logger';

/**
 * Rate limiting middleware for Next.js
 */
export async function withRateLimiting(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Skip rate limiting for excluded paths
    if (shouldSkipRateLimiting(request)) {
      return addRateLimitHeaders(NextResponse.next(), {
        allowed: true,
        limit: Number.MAX_SAFE_INTEGER,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: Date.now() + 3600000
      });
    }
    
    // Get current user if authenticated (for user-based rate limiting)
    let userId: string | undefined;
    try {
      // Extract user ID from session cookie if available
      const sessionCookie = request.cookies.get('wos-session')?.value;
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie);
          userId = sessionData.userId;
        } catch {
          // Invalid session data - continue with IP-based rate limiting only
        }
      }
    } catch {
      // User not authenticated - IP-based rate limiting only
    }
    
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, userId);
    
    // Log performance metrics
    const duration = Date.now() - startTime;
    if (duration > 100) { // Log slow rate limit checks
      await logSecurityEvent('security_alert_triggered', {
        request,
        message: 'Rate limiting performance issue',
        metadata: {
          duration,
          endpoint: request.nextUrl.pathname,
          ip: anonymizeIP(extractClientIP(request).ip),
          component: 'rate_limiting_middleware',
        },
      });
    }
    
    // Handle rate limit exceeded
    if (!rateLimitResult.allowed) {
      // Log rate limit violation
      await logRateLimitEvent('rate_limit_exceeded', {
        request,
        userId,
        message: `Rate limit exceeded for ${request.nextUrl.pathname}`,
        metadata: {
          endpoint: request.nextUrl.pathname,
          ip: anonymizeIP(extractClientIP(request).ip),
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          reason: rateLimitResult.reason,
          userId: userId,
          rateLimitRule: rateLimitResult.rule || 'default',
          timeWindow: rateLimitResult.window,
        },
      });

      if (RATE_LIMIT_CONFIG.debug) {
        console.log(`Rate limit exceeded for ${request.nextUrl.pathname}:`, {
          ip: anonymizeIP(extractClientIP(request).ip),
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reason: rateLimitResult.reason
        });
      }
      
      // Check for potential attack patterns
      if (rateLimitResult.reason?.includes('suspicious') || 
          rateLimitResult.remaining < -10) { // Significant over-limit
        await logSecurityEvent('rate_limit_pattern_detected', {
          request,
          userId,
          message: 'Suspicious rate limiting pattern detected',
          metadata: {
            endpoint: request.nextUrl.pathname,
            ip: anonymizeIP(extractClientIP(request).ip),
            overLimit: Math.abs(rateLimitResult.remaining),
            reason: rateLimitResult.reason,
            suspiciousIndicators: [
              rateLimitResult.remaining < -10 ? 'excessive_requests' : null,
              rateLimitResult.reason?.includes('suspicious') ? 'suspicious_pattern' : null,
            ].filter(Boolean),
          },
        });
      }
      
      // Return the rate limit response if one was provided
      if (rateLimitResult.response) {
        return rateLimitResult.response;
      }
      
      // Create a default rate limit response
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Log successful rate limit check for high-traffic endpoints
    if (isHighTrafficEndpoint(request.nextUrl.pathname)) {
      await logRateLimitEvent('rate_limit_warning', {
        request,
        userId,
        message: 'Rate limit check passed for high-traffic endpoint',
        metadata: {
          endpoint: request.nextUrl.pathname,
          remaining: rateLimitResult.remaining,
          limit: rateLimitResult.limit,
          utilizationPercent: ((rateLimitResult.limit - rateLimitResult.remaining) / rateLimitResult.limit) * 100,
        },
        customSeverity: 'low',
      });
    }
    
    // Request is allowed - continue and add rate limit headers
    const response = NextResponse.next();
    return addRateLimitHeaders(response, rateLimitResult);
    
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    
    // Log the error
    await logSecurityEvent('security_alert_triggered', {
      request,
      message: 'Rate limiting middleware error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: request.nextUrl.pathname,
        ip: anonymizeIP(extractClientIP(request).ip),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        component: 'rate_limiting_middleware',
      },
    });
    
    // Fail open - allow the request but log the error
    // In high-security environments, you might want to fail closed instead
    return NextResponse.next();
  }
}

/**
 * Determine if rate limiting should be skipped for this request
 */
function shouldSkipRateLimiting(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  
  // Skip for static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return true;
  }
  
  // Skip for health checks and monitoring
  const healthCheckPaths = [
    '/health',
    '/healthz',
    '/ping',
    '/status',
    '/.well-known/'
  ];
  
  if (healthCheckPaths.some(path => pathname.startsWith(path))) {
    return true;
  }
  
  // Skip if rate limiting is disabled
  if (!RATE_LIMIT_CONFIG.enabled) {
    return true;
  }
  
  return false;
}

/**
 * Check if endpoint is high-traffic and should be monitored more closely
 */
function isHighTrafficEndpoint(pathname: string): boolean {
  const highTrafficEndpoints = [
    '/api/auth',
    '/api/data',
    '/api/admin',
    '/dashboard',
    '/profile',
  ];
  
  return highTrafficEndpoints.some(endpoint => pathname.startsWith(endpoint));
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(response: NextResponse, result: any): NextResponse {
  if (result.limit !== undefined) {
    response.headers.set(RATE_LIMIT_HEADERS.LIMIT, result.limit.toString());
  }
  
  if (result.remaining !== undefined) {
    response.headers.set(RATE_LIMIT_HEADERS.REMAINING, result.remaining.toString());
  }
  
  if (result.resetTime !== undefined) {
    response.headers.set(RATE_LIMIT_HEADERS.RESET, Math.ceil(result.resetTime / 1000).toString());
  }
  
  if (result.retryAfter !== undefined) {
    response.headers.set(RATE_LIMIT_HEADERS.RETRY_AFTER, result.retryAfter.toString());
  }
  
  // Add rate limit window information
  if (result.window !== undefined) {
    response.headers.set(RATE_LIMIT_HEADERS.WINDOW, result.window.toString());
  }
  
  return response;
}

/**
 * Create a rate limit exceeded response
 */
function createRateLimitResponse(result: any): NextResponse {
  const response = NextResponse.json(
    {
      error: result.reason || 'Rate limit exceeded',
      code: result.code || 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    },
    { 
      status: 429,
      statusText: 'Too Many Requests'
    }
  );
  
  return addRateLimitHeaders(response, result);
}

/**
 * Enhanced rate limiting for specific endpoint patterns
 */
export async function withEnhancedRateLimiting(
  request: NextRequest,
  options?: {
    customRule?: { requests: number; window: number };
    userRequired?: boolean;
    skipGlobalLimits?: boolean;
  }
): Promise<NextResponse> {
  try {
    // Get current user if required
    let userId: string | undefined;
    if (options?.userRequired) {
      try {
        const sessionCookie = request.cookies.get('wos-session')?.value;
        if (sessionCookie) {
          const sessionData = JSON.parse(sessionCookie);
          userId = sessionData.userId;
          
          if (!userId) {
            await logSecurityEvent('authz_permission_denied', {
              request,
              message: 'Authentication required for enhanced rate limiting',
              metadata: {
                endpoint: request.nextUrl.pathname,
                reason: 'user_required',
              },
            });
            
            return NextResponse.json(
              { error: 'Authentication required', code: 'AUTH_REQUIRED' },
              { status: 401 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Authentication required', code: 'AUTH_REQUIRED' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }
    }
    
    // Apply rate limiting with custom options
    const rateLimiter = getRateLimiter();
    const result = await rateLimiter.checkRateLimit(request, userId);
    
    if (!result.allowed) {
      // Log enhanced rate limit violation
      await logRateLimitEvent('rate_limit_blocked', {
        request,
        userId,
        message: 'Enhanced rate limit exceeded',
        metadata: {
          endpoint: request.nextUrl.pathname,
          customRule: options?.customRule,
          userRequired: options?.userRequired,
          skipGlobalLimits: options?.skipGlobalLimits,
        },
      });
      
      return result.response || createRateLimitResponse(result);
    }
    
    return addRateLimitHeaders(NextResponse.next(), result);
    
  } catch (error) {
    console.error('Enhanced rate limiting error:', error);
    
    // Log error and fail open
    await logSecurityEvent('security_alert_triggered', {
      request,
      message: 'Enhanced rate limiting error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: request.nextUrl.pathname,
        ip: anonymizeIP(extractClientIP(request).ip),
        component: 'enhanced_rate_limiting',
      },
    });
    
    return NextResponse.next();
  }
}

/**
 * Rate limiting for authentication endpoints
 */
export async function withAuthRateLimiting(request: NextRequest): Promise<NextResponse> {
  // Log authentication endpoint access
  await logSecurityEvent('auth_login_success', { // This would be auth_request in real implementation
    request,
    message: `Authentication endpoint accessed: ${request.nextUrl.pathname}`,
    metadata: {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    },
    customSeverity: 'low',
  });
  
  return withEnhancedRateLimiting(request, {
    userRequired: false // Auth endpoints typically don't have users yet
  });
}

/**
 * Rate limiting for API endpoints
 */
export async function withAPIRateLimiting(request: NextRequest): Promise<NextResponse> {
  return withEnhancedRateLimiting(request, {
    userRequired: true // API endpoints typically require authentication
  });
}

/**
 * Admin endpoint rate limiting bypass
 */
export async function withAdminRateLimiting(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if user is admin by examining session
    let isAdmin = false;
    let userId: string | undefined;
    
    try {
      const sessionCookie = request.cookies.get('wos-session')?.value;
      if (sessionCookie) {
        const sessionData = JSON.parse(sessionCookie);
        userId = sessionData.userId;
        // This would need to be enhanced to check admin status from database
        // For now, we'll apply normal rate limiting with higher limits
      }
    } catch {
      // Continue with normal rate limiting
    }
    
    // Log admin endpoint access attempt
    await logSecurityEvent('admin_data_access', {
      request,
      userId,
      message: `Admin endpoint accessed: ${request.nextUrl.pathname}`,
      metadata: {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        isAdmin,
        userId,
      },
    });
    
    if (isAdmin && RATE_LIMIT_CONFIG.whitelist.adminBypass) {
      return withEnhancedRateLimiting(request, {
        userRequired: true,
        customRule: { requests: 1000, window: 300 } // Higher limits for admins
      });
    }
    
    return withEnhancedRateLimiting(request, {
      userRequired: true
    });
    
  } catch (error) {
    console.error('Admin rate limiting error:', error);
    
    await logSecurityEvent('security_alert_triggered', {
      request,
      message: 'Admin rate limiting error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: request.nextUrl.pathname,
        component: 'admin_rate_limiting',
      },
    });
    
    return NextResponse.json(
      { error: 'Access denied', code: 'ACCESS_DENIED' },
      { status: 403 }
    );
  }
}

/**
 * Utility function to check if current request is rate limited
 */
export async function isRateLimited(request: NextRequest, userId?: string): Promise<boolean> {
  try {
    if (shouldSkipRateLimiting(request)) {
      return false;
    }
    
    const result = await applyRateLimit(request, userId);
    return !result.allowed;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Fail open
  }
}

/**
 * Get rate limit information for current request
 */
export async function getRateLimitInfo(request: NextRequest, userId?: string): Promise<{
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  try {
    const result = await applyRateLimit(request, userId);
    return {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter
    };
  } catch (error) {
    console.error('Rate limit info error:', error);
    return {
      limit: 100,
      remaining: 100,
      resetTime: Date.now() + 3600000
    };
  }
}

/**
 * Middleware helper for conditional rate limiting
 */
export function createConditionalRateLimiter(
  condition: (request: NextRequest) => boolean,
  options?: {
    customRule?: { requests: number; window: number };
    userRequired?: boolean;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (condition(request)) {
      return withEnhancedRateLimiting(request, options);
    }
    return NextResponse.next();
  };
}

/**
 * Export rate limiting configuration for external use
 */
export { RATE_LIMIT_CONFIG } from '@/lib/rate-limit-config';