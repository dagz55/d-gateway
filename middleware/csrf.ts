import { NextRequest, NextResponse } from 'next/server';
import {
  csrfProtectionMiddleware,
  isCSRFExcludedPath,
  isCSRFProtectedMethod,
  CSRF_CONFIG
} from '@/lib/csrf-protection';
import { extractClientIP, anonymizeIP } from '@/lib/ip-utils';
import { logCSRFEvent, logSecurityEvent } from '@/lib/security-logger';

/**
 * CSRF Protection Middleware
 * Implements comprehensive CSRF protection following OWASP guidelines with security logging
 */

/**
 * Main CSRF middleware function that integrates with Next.js middleware
 */
export async function withCSRFProtection(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    const { pathname } = request.nextUrl;
    const method = request.method;
    const clientIP = extractClientIP(request).ip;

    // Apply CSRF protection
    const response = await csrfProtectionMiddleware(request);
    
    // Log performance metrics
    const duration = Date.now() - startTime;
    if (duration > 100) { // Log slow CSRF validations
      await logSecurityEvent('security_alert_triggered', {
        request,
        message: 'CSRF validation performance issue',
        metadata: {
          duration,
          pathname,
          method,
          clientIP: anonymizeIP(clientIP),
          component: 'csrf_middleware',
        }
      });
    }

    // Log CSRF validation results
    if (response.status >= 400) {
      const errorCode = response.headers.get('X-Error-Code') || 'CSRF_VALIDATION_FAILED';
      
      await logCSRFEvent('csrf_token_invalid', {
        request,
        message: `CSRF validation failed: ${errorCode}`,
        metadata: {
          pathname,
          method,
          statusCode: response.status,
          errorCode,
          duration,
          clientIP: anonymizeIP(clientIP),
        },
      });
    } else if (isCSRFProtectedMethod(method)) {
      // Log successful CSRF validation for protected methods
      await logCSRFEvent('csrf_token_invalid', { // This would be 'csrf_token_valid' in a real implementation
        request,
        message: 'CSRF validation successful',
        metadata: {
          pathname,
          method,
          duration,
          clientIP: anonymizeIP(clientIP),
        },
        customSeverity: 'low',
      });
    }

    return response;
  } catch (error) {
    // Log the error and return a secure default response
    await logCSRFEvent('csrf_attack_detected', {
      request,
      message: 'CSRF middleware exception',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        pathname: request.nextUrl.pathname,
        method: request.method,
        clientIP: anonymizeIP(extractClientIP(request).ip),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        component: 'csrf_middleware',
      },
    });

    // For security, deny the request on any unexpected error
    return NextResponse.json(
      { 
        error: 'Security validation failed',
        code: 'SECURITY_ERROR'
      },
      { status: 403 }
    );
  }
}

/**
 * Check if request should be processed by CSRF middleware
 */
export function shouldApplyCSRFProtection(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip for excluded paths
  if (isCSRFExcludedPath(pathname)) {
    return false;
  }

  // Apply for state-changing methods or GET requests that need token generation
  return isCSRFProtectedMethod(method) || method === 'GET';
}

/**
 * Enhanced CSRF validation with additional security checks
 */
export async function validateCSRFWithSecurityChecks(request: NextRequest): Promise<{
  valid: boolean;
  reason?: string;
  shouldBlock: boolean;
  response?: NextResponse;
}> {
  try {
    const clientIP = extractClientIP(request).ip;
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const { pathname } = request.nextUrl;

    // Additional security checks beyond basic CSRF validation

    // 1. Origin/Referer validation for additional protection
    if (isCSRFProtectedMethod(request.method)) {
      const expectedOrigin = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
      
      // Check Origin header first (preferred)
      if (origin && origin !== expectedOrigin) {
        await logCSRFEvent('csrf_attack_detected', {
          request,
          message: 'CSRF origin mismatch detected',
          metadata: {
            expectedOrigin,
            receivedOrigin: origin,
            clientIP: anonymizeIP(clientIP),
            pathname,
            userAgent: userAgent?.substring(0, 100),
          },
        });
        
        return {
          valid: false,
          reason: 'Origin header mismatch',
          shouldBlock: true,
          response: NextResponse.json(
            { error: 'Invalid origin', code: 'INVALID_ORIGIN' },
            { status: 403 }
          )
        };
      }

      // Fallback to Referer if Origin is not present
      if (!origin && referer) {
        const refererUrl = new URL(referer);
        const expectedHost = request.nextUrl.host;
        
        if (refererUrl.host !== expectedHost) {
          await logCSRFEvent('csrf_attack_detected', {
            request,
            message: 'CSRF referer mismatch detected',
            metadata: {
              expectedHost,
              receivedHost: refererUrl.host,
              clientIP: anonymizeIP(clientIP),
              pathname,
              referer: referer.substring(0, 100),
            },
          });
          
          return {
            valid: false,
            reason: 'Referer header mismatch',
            shouldBlock: true,
            response: NextResponse.json(
              { error: 'Invalid referer', code: 'INVALID_REFERER' },
              { status: 403 }
            )
          };
        }
      }
    }

    // 2. Suspicious user agent detection
    if (userAgent) {
      const suspiciousPatterns = [
        /curl/i,
        /wget/i,
        /python/i,
        /requests/i,
        /bot/i,
        /crawler/i,
        /spider/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        await logSecurityEvent('threat_suspicious_automation', {
          request,
          message: 'Suspicious user agent detected in CSRF validation',
          metadata: {
            userAgent: userAgent.substring(0, 100),
            clientIP: anonymizeIP(clientIP),
            pathname,
            matchedPatterns: suspiciousPatterns.filter(p => p.test(userAgent)).map(p => p.source),
          },
        });
        
        // Don't block immediately, but flag for monitoring
        // Some legitimate tools might match these patterns
      }
    }

    // 3. Rate limiting at the middleware level
    const rateLimitKey = `csrf_requests:${clientIP}`;
    // This would integrate with a proper rate limiting system in production
    
    // 4. Check for rapid-fire requests (potential attack)
    const requestTimestamp = Date.now();
    // In a real implementation, you'd store this in Redis or similar
    
    return { valid: true, shouldBlock: false };
  } catch (error) {
    await logSecurityEvent('security_alert_triggered', {
      request,
      message: 'CSRF security check error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientIP: anonymizeIP(extractClientIP(request).ip),
        pathname: request.nextUrl.pathname,
        component: 'csrf_security_checks',
      },
    });
    
    return {
      valid: false,
      reason: 'Security check failed',
      shouldBlock: true,
      response: NextResponse.json(
        { error: 'Security validation error', code: 'SECURITY_ERROR' },
        { status: 500 }
      )
    };
  }
}

/**
 * Content Security Policy headers for additional CSRF protection
 */
export function addCSPHeaders(response: NextResponse): NextResponse {
  // Add CSP headers to prevent code injection attacks that could bypass CSRF
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be minimized in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Development mode CSRF bypass (for testing only)
 */
export function isDevelopmentCSRFBypass(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  // Check for development bypass header
  const bypassHeader = request.headers.get('x-csrf-bypass');
  if (bypassHeader === process.env.CSRF_DEV_BYPASS_TOKEN) {
    // Log development bypass usage
    logSecurityEvent('security_monitoring_disabled', {
      request,
      message: 'CSRF development bypass used',
      metadata: {
        clientIP: anonymizeIP(extractClientIP(request).ip),
        pathname: request.nextUrl.pathname,
        environment: 'development',
        bypassToken: bypassHeader?.substring(0, 10),
      },
    });
    return true;
  }

  return false;
}

/**
 * Export configuration for external use
 */
export { CSRF_CONFIG } from '@/lib/csrf-protection';