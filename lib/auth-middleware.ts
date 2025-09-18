import { NextRequest, NextResponse } from 'next/server';
import { workos, workosConfig, validateWorkOSConfig } from './workos';
import { cookies } from 'next/headers';
import { 
  SESSION_CONFIG,
  validateSecureSession,
  clearSecureSessionCookies,
  logSecurityEvent,
  SecureSessionData
} from './session-security';
import { tokenValidator, TokenSource } from './token-validation';
import { sessionManager } from './session-manager';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  authenticated: boolean;
}

export interface TokenAuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    sessionId: string;
    permissions: string[];
  };
  shouldRefresh?: boolean;
  error?: string;
}

/**
 * Enhanced authentication middleware for protected routes with session versioning
 * Supports both legacy session cookies and new JWT token authentication with session validation
 */
export async function withAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
  tokenAuth?: TokenAuthResult;
  authMethod?: 'session' | 'token';
  sessionVersion?: number;
}> {
  try {
    // Validate WorkOS configuration
    validateWorkOSConfig();

    // First, try JWT token authentication (preferred method)
    const tokenAuth = await tryTokenAuth(request);
    if (tokenAuth.authenticated && tokenAuth.user?.sessionId) {
      // Validate session version and activity
      const sessionValidation = await sessionManager.validateSession(tokenAuth.user.sessionId);
      
      if (sessionValidation.valid && sessionValidation.session) {
        // Update session activity
        await sessionManager.updateSessionActivity(tokenAuth.user.sessionId, request);
        
        return {
          authenticated: true,
          user: {
            id: tokenAuth.user!.id,
            email: '', // Token doesn't contain email, would need profile lookup
            firstName: '',
            lastName: '',
            profilePictureUrl: undefined,
            createdAt: '',
            updatedAt: '',
          },
          tokenAuth,
          authMethod: 'token',
          sessionVersion: sessionValidation.session.sessionVersion,
        };
      } else {
        // Session invalid, log and continue to session auth
        logSecurityEvent('session_version_invalid', {
          userId: tokenAuth.user.id,
          sessionId: tokenAuth.user.sessionId,
          reason: sessionValidation.reason || 'Session validation failed',
          userAgent: request.headers.get('user-agent')?.substring(0, 100),
          ipAddress: getClientIP(request)
        });
      }
    }

    // Fallback to legacy session authentication
    const sessionAuth = await trySessionAuth(request);
    if (sessionAuth.authenticated) {
      return {
        ...sessionAuth,
        authMethod: 'session',
      };
    }

    // Both authentication methods failed
    logSecurityEvent('session_expired', {
      reason: 'No valid authentication found',
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request)
    });

    return {
      authenticated: false,
      response: NextResponse.redirect(new URL('/', request.url))
    };

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    logSecurityEvent('session_expired', {
      reason: 'Auth middleware error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request)
    });
    
    // Clear cookies and redirect to login on any error
    await clearSecureSessionCookies();
    
    return {
      authenticated: false,
      response: NextResponse.redirect(new URL('/auth/login', request.url))
    };
  }
}

/**
 * Try JWT token authentication with session validation
 */
async function tryTokenAuth(request: NextRequest): Promise<TokenAuthResult> {
  try {
    const validation = await tokenValidator.validateAccessToken(request, {
      requireSession: true,
      checkBinding: true,
    });

    if (validation.valid && validation.sessionId) {
      // Additional session version validation
      const sessionValidation = await sessionManager.validateSession(validation.sessionId);
      
      if (!sessionValidation.valid) {
        return {
          authenticated: false,
          error: `Session validation failed: ${sessionValidation.reason}`,
        };
      }

      return {
        authenticated: true,
        user: {
          id: validation.userId!,
          sessionId: validation.sessionId!,
          permissions: validation.permissions || [],
        },
        shouldRefresh: validation.shouldRefresh,
      };
    }

    return {
      authenticated: false,
      error: validation.error,
    };
  } catch (error) {
    console.error('Token auth error:', error);
    return {
      authenticated: false,
      error: 'Token authentication failed',
    };
  }
}

/**
 * Try legacy session authentication with enhanced validation
 */
async function trySessionAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
}> {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

    if (!sessionData) {
      return { authenticated: false };
    }

    // Parse the session data
    let userData: SecureSessionData;
    try {
      userData = JSON.parse(sessionData);
    } catch (error) {
      logSecurityEvent('session_expired', {
        reason: 'Invalid session data format',
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
        ipAddress: getClientIP(request)
      });

      await clearSecureSessionCookies();
      return {
        authenticated: false,
        response: NextResponse.redirect(new URL('/', request.url))
      };
    }

    // Validate session security
    const sessionValidation = validateSecureSession(userData, request);
    if (!sessionValidation.valid) {
      logSecurityEvent('session_expired', {
        reason: sessionValidation.reason || 'Session validation failed',
        userId: userData.userId,
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
        ipAddress: getClientIP(request)
      });

      await clearSecureSessionCookies();
      return {
        authenticated: false,
        response: NextResponse.redirect(new URL('/', request.url))
      };
    }

    // Check if we have valid user data
    if (userData && userData.userId) {
      const authenticatedUser: AuthenticatedUser = {
        id: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePictureUrl: userData.profilePictureUrl,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      return {
        authenticated: true,
        user: authenticatedUser
      };
    }

    return { authenticated: false };
  } catch (error) {
    console.error('Session auth error:', error);
    return { authenticated: false };
  }
}

/**
 * Enhanced authentication middleware with token support for API routes
 */
export async function withAPIAuth(
  request: NextRequest,
  options: {
    requiredPermissions?: string[];
    allowSession?: boolean;
    allowToken?: boolean;
    requireSessionVersion?: number;
  } = {}
): Promise<{
  authenticated: boolean;
  user?: {
    id: string;
    sessionId?: string;
    permissions: string[];
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  shouldRefresh?: boolean;
  error?: string;
  authMethod?: 'session' | 'token';
  sessionVersion?: number;
}> {
  const { 
    requiredPermissions = [], 
    allowSession = true, 
    allowToken = true,
    requireSessionVersion
  } = options;

  try {
    // Try token authentication first (if allowed)
    if (allowToken) {
      const tokenValidation = await tokenValidator.validateForAPI(request, requiredPermissions);
      
      if (tokenValidation.authorized && tokenValidation.user?.sessionId) {
        // Validate session version if required
        const sessionValidation = await sessionManager.validateSession(
          tokenValidation.user.sessionId,
          requireSessionVersion
        );
        
        if (sessionValidation.valid && sessionValidation.session) {
          // Update session activity
          await sessionManager.updateSessionActivity(tokenValidation.user.sessionId, request);
          
          return {
            authenticated: true,
            user: {
              id: tokenValidation.user!.id,
              sessionId: tokenValidation.user!.sessionId,
              permissions: tokenValidation.user!.permissions,
            },
            shouldRefresh: tokenValidation.shouldRefresh,
            authMethod: 'token',
            sessionVersion: sessionValidation.session.sessionVersion,
          };
        } else {
          // Session version outdated or invalid
          return {
            authenticated: false,
            error: sessionValidation.reason || 'Session validation failed',
          };
        }
      }

      // If token auth failed but we only allow tokens, return the error
      if (!allowSession) {
        return {
          authenticated: false,
          error: tokenValidation.error,
        };
      }
    }

    // Try session authentication (if allowed)
    if (allowSession) {
      const sessionAuth = await trySessionAuth(request);
      
      if (sessionAuth.authenticated && sessionAuth.user) {
        // For session auth, we assume basic user permissions
        const userPermissions = ['user'];
        
        // Check required permissions
        if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
          );

          if (!hasAllPermissions) {
            return {
              authenticated: false,
              error: 'Insufficient permissions',
            };
          }
        }

        return {
          authenticated: true,
          user: {
            id: sessionAuth.user.id,
            permissions: userPermissions,
            email: sessionAuth.user.email,
            firstName: sessionAuth.user.firstName,
            lastName: sessionAuth.user.lastName,
          },
          authMethod: 'session',
        };
      }
    }

    return {
      authenticated: false,
      error: 'No valid authentication found',
    };

  } catch (error) {
    console.error('API auth error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Get the current authenticated user with session validation
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    // Try to get user from token first
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (accessToken) {
      const validation = tokenValidator.validateForAPI(
        { 
          cookies: { get: () => ({ value: accessToken }) },
          headers: { get: () => null } // Add missing headers mock
        } as any,
        []
      );
      
      if ((await validation).authorized && (await validation).user?.sessionId) {
        // Validate session
        const sessionValidation = await sessionManager.validateSession((await validation).user!.sessionId);
        
        if (sessionValidation.valid) {
          // Token is valid and session is active
          return {
            id: (await validation).user!.id,
            email: '',
            firstName: '',
            lastName: '',
            profilePictureUrl: undefined,
            createdAt: '',
            updatedAt: '',
          };
        }
      }
    }

    // Fallback to session authentication
    const sessionData = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

    if (!sessionData) {
      return null;
    }

    // Parse the session data
    let userData: SecureSessionData;
    try {
      userData = JSON.parse(sessionData);
    } catch (error) {
      logSecurityEvent('session_expired', {
        reason: 'Invalid session data format in getCurrentUser'
      });
      await clearSecureSessionCookies();
      return null;
    }

    // Basic validation of session expiry
    if (userData.sessionExpiry && Date.now() > userData.sessionExpiry) {
      logSecurityEvent('session_expired', {
        reason: 'Session expired in getCurrentUser',
        userId: userData.userId
      });
      await clearSecureSessionCookies();
      return null;
    }

    // Check if we have valid user data
    if (!userData || !userData.userId) {
      return null;
    }
    
    return {
      id: userData.userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePictureUrl: userData.profilePictureUrl,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if current user has specific permission with session validation
 */
export async function hasPermission(
  request: NextRequest,
  permission: string
): Promise<boolean> {
  try {
    const apiAuth = await withAPIAuth(request, {
      requiredPermissions: [permission],
    });
    
    return apiAuth.authenticated;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if current user is admin with session validation
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  return hasPermission(request, 'admin');
}

/**
 * Validate cookie settings for security compliance
 */
export function validateCookieSettings(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, ensure secure cookies are enforced
    if (!process.env.COOKIE_DOMAIN) {
      warnings.push('COOKIE_DOMAIN should be set in production for security');
    }
    
    // Check if HTTPS is being used
    if (!process.env.NEXTAUTH_URL?.startsWith('https://')) {
      errors.push('HTTPS must be used in production for secure cookies');
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Helper function to securely extract client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Try multiple headers to get the real client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const fastlyClientIp = request.headers.get('fastly-client-ip'); // Fastly
  const vercelForwardedIp = request.headers.get('x-vercel-forwarded-for'); // Vercel
  
  // Return the first valid IP found
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || 
                   realIp || 
                   cfConnectingIp || 
                   fastlyClientIp || 
                   vercelForwardedIp || 
                   'unknown';
  
  return ipAddress;
}

/**
 * Helper function to check if session timeout warning should be displayed
 */
export async function getSessionTimeoutInfo(): Promise<{
  shouldWarn: boolean;
  timeRemaining: number;
  sessionValid: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

    if (!sessionData) {
      return { shouldWarn: false, timeRemaining: 0, sessionValid: false };
    }

    const userData: SecureSessionData = JSON.parse(sessionData);
    
    if (!userData.sessionExpiry) {
      return { shouldWarn: false, timeRemaining: 0, sessionValid: false };
    }

    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((userData.sessionExpiry - now) / 1000));
    const warningThreshold = 60 * 60; // 1 hour in seconds
    
    return {
      shouldWarn: timeRemaining <= warningThreshold && timeRemaining > 0,
      timeRemaining,
      sessionValid: timeRemaining > 0
    };
  } catch (error) {
    console.error('Session timeout info error:', error);
    return { shouldWarn: false, timeRemaining: 0, sessionValid: false };
  }
}

/**
 * Helper function to clear session on logout with session invalidation
 */
export async function clearUserSession(userId?: string, sessionId?: string): Promise<void> {
  try {
    // Clear legacy session cookies
    await clearSecureSessionCookies();
    
    // Invalidate session in session manager if we have the info
    if (userId && sessionId) {
      await sessionManager.invalidateSession(sessionId, 'user_logout', userId);
    }
    
    logSecurityEvent('session_cleared', {
      reason: 'User logout',
      userId,
      sessionId,
    });
  } catch (error) {
    console.error('Failed to clear user session:', error);
    throw error;
  }
}

// Re-export logSecurityEvent for use in other modules
export { logSecurityEvent };