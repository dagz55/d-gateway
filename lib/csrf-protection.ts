import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  generateCSRFToken,
  validateCSRFToken,
  generateSessionFingerprint,
  encodeTokenForCookie,
  decodeTokenFromCookie,
  csrfRateLimiter,
  TokenResult
} from './crypto-utils';
import { getClientIP, logSecurityEvent } from './auth-middleware';

/**
 * CSRF Protection Configuration
 */
export const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  MAX_AGE: 3600000, // 1 hour in milliseconds
  HEADER_NAME: 'x-csrf-token',
  COOKIE_NAME: 'csrf-token',
  FINGERPRINT_COOKIE: 'csrf-fp',
  EXCLUDE_PATHS: [
    '/api/auth/workos/callback',
    '/api/auth/workos/login',
    '/api/auth/workos/logout',
    '/api/auth/workos/me',
    '/api/crypto/prices',
    '/_next/',
    '/favicon.ico'
  ],
  PROTECTED_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH'],
  SECURE_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  }
};

/**
 * CSRF Token Management Interface
 */
export interface CSRFTokenData {
  token: string;
  timestamp: number;
  fingerprint: string;
  hash: string;
}

/**
 * CSRF Protection Result
 */
export interface CSRFValidationResult {
  valid: boolean;
  reason?: string;
  newToken?: CSRFTokenData;
  response?: NextResponse;
}

/**
 * Generate a new CSRF token for the current session
 */
export async function generateNewCSRFToken(request: NextRequest): Promise<{
  token: CSRFTokenData;
  response: NextResponse;
}> {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting check
    if (!csrfRateLimiter.isAllowed(clientIP)) {
      logSecurityEvent('csrf_rate_limit_exceeded', {
        clientIP,
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      });
      
      throw new Error('Rate limit exceeded for CSRF token generation');
    }

    // Generate session fingerprint
    const fingerprint = generateSessionFingerprint(
      request.headers.get('user-agent'),
      request.headers.get('accept-language'),
      request.headers.get('accept-encoding'),
      clientIP
    );

    // Generate CSRF token
    const tokenResult = generateCSRFToken(fingerprint);
    
    // Create response with CSRF token in cookie
    const response = NextResponse.next();
    
    // Set CSRF token cookie
    const encodedToken = encodeTokenForCookie(tokenResult);
    response.cookies.set(CSRF_CONFIG.COOKIE_NAME, encodedToken, {
      ...CSRF_CONFIG.SECURE_COOKIE_OPTIONS,
      maxAge: CSRF_CONFIG.MAX_AGE / 1000 // Convert to seconds
    });

    // Set fingerprint cookie for additional validation
    response.cookies.set(CSRF_CONFIG.FINGERPRINT_COOKIE, fingerprint, {
      ...CSRF_CONFIG.SECURE_COOKIE_OPTIONS,
      maxAge: CSRF_CONFIG.MAX_AGE / 1000
    });

    // Add token to response headers for client-side access
    response.headers.set('X-CSRF-Token', tokenResult.token);

    logSecurityEvent('csrf_token_generated', {
      clientIP,
      fingerprint: fingerprint.substring(0, 8) + '...' // Log partial fingerprint
    });

    return {
      token: tokenResult,
      response
    };
  } catch (error) {
    logSecurityEvent('csrf_token_generation_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      clientIP: getClientIP(request)
    });
    
    throw error;
  }
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFTokenFromRequest(request: NextRequest): Promise<CSRFValidationResult> {
  try {
    const clientIP = getClientIP(request);
    
    // Get CSRF token from header
    const providedToken = request.headers.get(CSRF_CONFIG.HEADER_NAME);
    if (!providedToken) {
      return {
        valid: false,
        reason: 'Missing CSRF token in header'
      };
    }

    // Get stored token from cookie
    const cookieStore = await cookies();
    const storedTokenCookie = cookieStore.get(CSRF_CONFIG.COOKIE_NAME);
    if (!storedTokenCookie?.value) {
      return {
        valid: false,
        reason: 'Missing CSRF token cookie'
      };
    }

    // Decode stored token
    const storedTokenData = decodeTokenFromCookie(storedTokenCookie.value);
    if (!storedTokenData) {
      return {
        valid: false,
        reason: 'Invalid CSRF token cookie format'
      };
    }

    // Generate current session fingerprint
    const currentFingerprint = generateSessionFingerprint(
      request.headers.get('user-agent'),
      request.headers.get('accept-language'),
      request.headers.get('accept-encoding'),
      clientIP
    );

    // Validate fingerprint cookie matches current fingerprint
    const fingerprintCookie = cookieStore.get(CSRF_CONFIG.FINGERPRINT_COOKIE);
    if (!fingerprintCookie?.value || fingerprintCookie.value !== currentFingerprint) {
      logSecurityEvent('csrf_fingerprint_mismatch', {
        clientIP,
        expectedFingerprint: currentFingerprint.substring(0, 8) + '...',
        receivedFingerprint: (fingerprintCookie?.value || 'none').substring(0, 8) + '...'
      });
      
      return {
        valid: false,
        reason: 'Session fingerprint mismatch'
      };
    }

    // Validate CSRF token
    const validation = validateCSRFToken(
      providedToken,
      storedTokenData,
      currentFingerprint,
      CSRF_CONFIG.MAX_AGE
    );

    if (!validation.valid) {
      logSecurityEvent('csrf_token_validation_failed', {
        reason: validation.reason || 'Unknown validation failure',
        clientIP,
        tokenAge: Date.now() - storedTokenData.timestamp
      });
      
      return {
        valid: false,
        reason: validation.reason
      };
    }

    // Check if token needs rotation (older than 30 minutes)
    const tokenAge = Date.now() - storedTokenData.timestamp;
    const rotationThreshold = CSRF_CONFIG.MAX_AGE * 0.5; // 30 minutes

    if (tokenAge > rotationThreshold) {
      // Generate new token for rotation
      const newTokenResult = generateCSRFToken(currentFingerprint);
      
      logSecurityEvent('csrf_token_rotated', {
        clientIP,
        oldTokenAge: tokenAge,
        fingerprint: currentFingerprint.substring(0, 8) + '...'
      });

      return {
        valid: true,
        newToken: newTokenResult
      };
    }

    return { valid: true };
  } catch (error) {
    logSecurityEvent('csrf_validation_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      clientIP: getClientIP(request)
    });
    
    return {
      valid: false,
      reason: 'CSRF validation error'
    };
  }
}

/**
 * Check if path should be excluded from CSRF protection
 */
export function isCSRFExcludedPath(pathname: string): boolean {
  return CSRF_CONFIG.EXCLUDE_PATHS.some(excludePath => 
    pathname.startsWith(excludePath)
  );
}

/**
 * Check if HTTP method requires CSRF protection
 */
export function isCSRFProtectedMethod(method: string): boolean {
  return CSRF_CONFIG.PROTECTED_METHODS.includes(method.toUpperCase());
}

/**
 * Middleware function for CSRF protection
 */
export async function csrfProtectionMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Skip CSRF protection for excluded paths
    if (isCSRFExcludedPath(pathname)) {
      return NextResponse.next();
    }

    // Skip CSRF protection for non-state-changing methods
    if (!isCSRFProtectedMethod(method)) {
      // For GET requests, generate a new token if none exists
      if (method === 'GET') {
        try {
          const cookieStore = await cookies();
          const existingToken = cookieStore.get(CSRF_CONFIG.COOKIE_NAME);
          
          if (!existingToken) {
            const { response } = await generateNewCSRFToken(request);
            return response;
          }
        } catch (error) {
          // If token generation fails, continue without CSRF token
          console.warn('Failed to generate CSRF token for GET request:', error);
        }
      }
      
      return NextResponse.next();
    }

    // Validate CSRF token for state-changing methods
    const validation = await validateCSRFTokenFromRequest(request);
    
    if (!validation.valid) {
      logSecurityEvent('csrf_attack_blocked', {
        reason: validation.reason || 'Invalid CSRF token',
        method,
        pathname,
        clientIP: getClientIP(request),
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      });

      return NextResponse.json(
        { 
          error: 'CSRF token validation failed',
          code: 'CSRF_INVALID'
        },
        { status: 403 }
      );
    }

    // If token needs rotation, update the response with new token
    if (validation.newToken) {
      const response = NextResponse.next();
      
      const encodedToken = encodeTokenForCookie(validation.newToken);
      response.cookies.set(CSRF_CONFIG.COOKIE_NAME, encodedToken, {
        ...CSRF_CONFIG.SECURE_COOKIE_OPTIONS,
        maxAge: CSRF_CONFIG.MAX_AGE / 1000
      });
      
      response.headers.set('X-CSRF-Token', validation.newToken.token);
      
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    logSecurityEvent('csrf_middleware_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      pathname: request.nextUrl.pathname,
      method: request.method,
      clientIP: getClientIP(request)
    });

    // On error, deny the request for security
    return NextResponse.json(
      { 
        error: 'CSRF protection error',
        code: 'CSRF_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Server action to get current CSRF token for client-side use
 */
export async function getCurrentCSRFToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CSRF_CONFIG.COOKIE_NAME);
    
    if (!tokenCookie?.value) {
      return null;
    }

    const tokenData = decodeTokenFromCookie(tokenCookie.value);
    return tokenData?.token || null;
  } catch (error) {
    console.error('Failed to get current CSRF token:', error);
    return null;
  }
}

/**
 * Clear CSRF tokens (for logout)
 */
export async function clearCSRFTokens(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CSRF_CONFIG.COOKIE_NAME);
    cookieStore.delete(CSRF_CONFIG.FINGERPRINT_COOKIE);
    
    logSecurityEvent('csrf_tokens_cleared', {
      reason: 'User logout or session cleanup'
    });
  } catch (error) {
    console.error('Failed to clear CSRF tokens:', error);
  }
}