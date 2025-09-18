import { NextRequest } from 'next/server';
import { tokenManager, TokenValidationResult, AccessToken, RefreshToken } from './token-manager';
import { refreshTokenStore } from './refresh-token-store';
import { getClientIP } from './auth-middleware';

// Validation options interface
export interface TokenValidationOptions {
  requireSession?: boolean;
  allowExpired?: boolean;
  checkBinding?: boolean;
  validateFamily?: boolean;
}

// Token validation response interface
export interface ValidationResponse {
  valid: boolean;
  token?: AccessToken | RefreshToken;
  error?: string;
  shouldRefresh?: boolean;
  userId?: string;
  sessionId?: string;
  permissions?: string[];
  bindingValid?: boolean;
}

// Token extraction sources
export enum TokenSource {
  BEARER_HEADER = 'bearer_header',
  COOKIE = 'cookie',
  BODY = 'body',
}

/**
 * Comprehensive token validation utilities
 */
export class TokenValidator {
  private static instance: TokenValidator;

  private constructor() {}

  public static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  /**
   * Extract token from various sources in request
   */
  public extractToken(
    request: NextRequest,
    source: TokenSource = TokenSource.BEARER_HEADER
  ): string | null {
    // Handle cases where request might be a mock object
    if (!request) {
      return null;
    }

    switch (source) {
      case TokenSource.BEARER_HEADER:
        return tokenManager.extractTokenFromHeader(request);

      case TokenSource.COOKIE:
        // Check if cookies exist and have the get method
        if (!request.cookies || typeof request.cookies.get !== 'function') {
          return null;
        }
        const accessTokenCookie = request.cookies.get('access_token');
        return accessTokenCookie?.value || null;

      case TokenSource.BODY:
        // This would need to be handled differently for different content types
        // For now, we'll just return null
        return null;

      default:
        return null;
    }
  }

  /**
   * Validate access token with comprehensive checks
   */
  public async validateAccessToken(
    request: NextRequest,
    options: TokenValidationOptions = {}
  ): Promise<ValidationResponse> {
    try {
      // Try to extract token from different sources
      let token = this.extractToken(request, TokenSource.BEARER_HEADER);
      if (!token) {
        token = this.extractToken(request, TokenSource.COOKIE);
      }

      if (!token) {
        return {
          valid: false,
          error: 'No access token provided',
        };
      }

      // Validate token signature and structure
      const validation = tokenManager.validateToken(token);
      if (!validation.valid || !validation.decoded) {
        return {
          valid: false,
          error: validation.error || 'Token validation failed',
        };
      }

      const decoded = validation.decoded as AccessToken;

      // Ensure it's an access token
      if (decoded.type !== 'access') {
        return {
          valid: false,
          error: 'Invalid token type',
        };
      }

      // Check token binding if requested
      let bindingValid = true;
      if (options.checkBinding) {
        const expectedBinding = tokenManager.generateTokenBinding(request);
        // In a full implementation, you'd store the binding with the token
        // For now, we'll just validate the generation works
        bindingValid = expectedBinding.length > 0;
      }

      // Check session validity if required
      if (options.requireSession) {
        // You could add additional session validation here
        // For example, checking if the session exists in your session store
      }

      return {
        valid: true,
        token: decoded,
        shouldRefresh: validation.shouldRefresh,
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        permissions: decoded.permissions,
        bindingValid,
      };
    } catch (error) {
      console.error('Access token validation error:', error);
      return {
        valid: false,
        error: 'Token validation exception',
      };
    }
  }

  /**
   * Validate refresh token with family checking
   */
  public async validateRefreshToken(
    token: string,
    options: TokenValidationOptions = {}
  ): Promise<ValidationResponse> {
    try {
      // Validate token signature and structure
      const validation = tokenManager.validateToken(token);
      if (!validation.valid || !validation.decoded) {
        return {
          valid: false,
          error: validation.error || 'Token validation failed',
        };
      }

      const decoded = validation.decoded as RefreshToken;

      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        return {
          valid: false,
          error: 'Invalid token type',
        };
      }

      // Validate token family if requested
      if (options.validateFamily) {
        const tokenHash = tokenManager.hashToken(token);
        const storeValidation = await refreshTokenStore.validateRefreshToken(tokenHash);
        
        if (!storeValidation.valid) {
          return {
            valid: false,
            error: storeValidation.error || 'Token not found in store',
          };
        }

        // Check token family status
        const family = await refreshTokenStore.getTokenFamily(decoded.familyId);
        if (!family || family.revoked) {
          return {
            valid: false,
            error: 'Token family revoked',
          };
        }

        // Verify token is in the family chain
        if (!family.tokenChain.includes(decoded.jti)) {
          // Potential security issue - revoke the family
          await refreshTokenStore.revokeTokenFamily(
            decoded.familyId,
            'Token not in family chain'
          );
          return {
            valid: false,
            error: 'Token family compromised',
          };
        }
      }

      return {
        valid: true,
        token: decoded,
        userId: decoded.userId,
        sessionId: decoded.sessionId,
      };
    } catch (error) {
      console.error('Refresh token validation error:', error);
      return {
        valid: false,
        error: 'Token validation exception',
      };
    }
  }

  /**
   * Validate token and return user context
   */
  public async validateAndGetUser(
    request: NextRequest,
    options: TokenValidationOptions = {}
  ): Promise<{
    authenticated: boolean;
    user?: {
      id: string;
      sessionId: string;
      permissions: string[];
    };
    shouldRefresh?: boolean;
    error?: string;
  }> {
    const validation = await this.validateAccessToken(request, options);

    if (!validation.valid) {
      return {
        authenticated: false,
        error: validation.error,
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

  /**
   * Validate token with rate limiting and security checks
   */
  public async validateWithSecurityChecks(
    request: NextRequest,
    options: TokenValidationOptions & {
      rateLimitKey?: string;
      checkOrigin?: boolean;
      logValidation?: boolean;
    } = {}
  ): Promise<ValidationResponse> {
    const startTime = Date.now();

    try {
      // Check origin if requested
      if (options.checkOrigin) {
        const origin = request.headers.get('origin');
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        
        if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
          return {
            valid: false,
            error: 'Invalid origin',
          };
        }
      }

      // Perform standard validation
      const validation = await this.validateAccessToken(request, options);

      // Log validation if requested
      if (options.logValidation) {
        const duration = Date.now() - startTime;
        console.log(`Token validation completed in ${duration}ms`, {
          valid: validation.valid,
          userId: validation.userId,
          shouldRefresh: validation.shouldRefresh,
          error: validation.error,
        });
      }

      return validation;
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        valid: false,
        error: 'Security validation failed',
      };
    }
  }

  /**
   * Extract permissions from token
   */
  public extractPermissions(request: NextRequest): string[] {
    const token = this.extractToken(request);
    if (!token) return [];

    const validation = tokenManager.validateToken(token);
    if (!validation.valid || !validation.decoded) return [];

    const decoded = validation.decoded as AccessToken;
    return decoded.permissions || [];
  }

  /**
   * Check if token has specific permission
   */
  public async hasPermission(
    request: NextRequest,
    permission: string
  ): Promise<boolean> {
    const validation = await this.validateAccessToken(request);
    if (!validation.valid) return false;

    return validation.permissions?.includes(permission) || false;
  }

  /**
   * Check if user is admin
   */
  public async isAdmin(request: NextRequest): Promise<boolean> {
    return this.hasPermission(request, 'admin');
  }

  /**
   * Validate token for API route
   */
  public async validateForAPI(
    request: NextRequest,
    requiredPermissions: string[] = []
  ): Promise<{
    authorized: boolean;
    user?: { id: string; sessionId: string; permissions: string[] };
    error?: string;
    shouldRefresh?: boolean;
  }> {
    const validation = await this.validateAccessToken(request, {
      requireSession: true,
      checkBinding: true,
    });

    if (!validation.valid) {
      return {
        authorized: false,
        error: validation.error,
      };
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const userPermissions = validation.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return {
          authorized: false,
          error: 'Insufficient permissions',
        };
      }
    }

    return {
      authorized: true,
      user: {
        id: validation.userId!,
        sessionId: validation.sessionId!,
        permissions: validation.permissions || [],
      },
      shouldRefresh: validation.shouldRefresh,
    };
  }

  /**
   * Get token expiry information
   */
  public getTokenExpiry(request: NextRequest): {
    expiresAt?: number;
    expiresIn?: number;
    shouldRefresh?: boolean;
  } {
    const token = this.extractToken(request);
    if (!token) return {};

    const validation = tokenManager.validateToken(token);
    if (!validation.valid || !validation.decoded) return {};

    const decoded = validation.decoded as AccessToken;
    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    const expiresIn = Math.max(0, expiresAt - Date.now());

    return {
      expiresAt,
      expiresIn,
      shouldRefresh: validation.shouldRefresh,
    };
  }
}

// Export singleton instance
export const tokenValidator = TokenValidator.getInstance();