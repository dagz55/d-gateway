import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Token configuration constants
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 60 * 60, // 1 hour in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_BEFORE_EXPIRY: 5 * 60, // Refresh 5 minutes before expiry
  MAX_FAMILY_CHAIN_LENGTH: 10, // Maximum token family chain length
  JWT_ALGORITHM: 'HS256' as const,
  TOKEN_VERSION: '1.0',
} as const;

// Token type definitions
export interface AccessToken {
  type: 'access';
  userId: string;
  sessionId: string;
  permissions: string[];
  iat: number;
  exp: number;
  jti: string; // unique token ID
  version: string;
}

export interface RefreshToken {
  type: 'refresh';
  userId: string;
  sessionId: string;
  accessTokenId: string;
  familyId: string; // Token family tracking
  iat: number;
  exp: number;
  jti: string;
  version: string;
}

export interface TokenFamily {
  familyId: string;
  userId: string;
  sessionId: string;
  createdAt: number;
  lastUsed: number;
  tokenChain: string[]; // Track token lineage
  revoked: boolean;
  revokedAt?: number;
  revokedReason?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface TokenValidationResult {
  valid: boolean;
  decoded?: AccessToken | RefreshToken;
  error?: string;
  shouldRefresh?: boolean;
}

/**
 * Core token manager class for handling JWT tokens with rotation
 */
export class TokenManager {
  private static instance: TokenManager;
  private jwtSecret: string;
  private issuer: string;

  private constructor() {
    this.jwtSecret = this.getJWTSecret();
    this.issuer = process.env.NEXT_PUBLIC_APP_URL || 'https://zignal-login.vercel.app';
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get or generate JWT secret with proper validation
   */
  private getJWTSecret(): string {
    const secret = process.env.JWT_SECRET || process.env.WORKOS_COOKIE_PASSWORD;
    
    if (!secret) {
      throw new Error('JWT_SECRET or WORKOS_COOKIE_PASSWORD must be set');
    }

    if (secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }

    return secret;
  }

  /**
   * Generate cryptographically secure unique ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate session ID with timestamp
   */
  public generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = this.generateUniqueId();
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Generate family ID for token family tracking
   */
  public generateFamilyId(): string {
    return `fam_${this.generateUniqueId()}`;
  }

  /**
   * Create access token with specified payload
   */
  public createAccessToken(payload: {
    userId: string;
    sessionId: string;
    permissions?: string[];
  }): { token: string; decoded: AccessToken } {
    const now = Math.floor(Date.now() / 1000);
    const jti = this.generateUniqueId();

    const tokenPayload: AccessToken = {
      type: 'access',
      userId: payload.userId,
      sessionId: payload.sessionId,
      permissions: payload.permissions || ['user'],
      iat: now,
      exp: now + TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
      jti,
      version: TOKEN_CONFIG.TOKEN_VERSION,
    };

    const token = jwt.sign(tokenPayload, this.jwtSecret, {
      algorithm: TOKEN_CONFIG.JWT_ALGORITHM,
      issuer: this.issuer,
      audience: 'zignal-app',
    });

    return { token, decoded: tokenPayload };
  }

  /**
   * Create refresh token with family tracking
   */
  public createRefreshToken(payload: {
    userId: string;
    sessionId: string;
    accessTokenId: string;
    familyId?: string;
  }): { token: string; decoded: RefreshToken } {
    const now = Math.floor(Date.now() / 1000);
    const jti = this.generateUniqueId();
    const familyId = payload.familyId || this.generateFamilyId();

    const tokenPayload: RefreshToken = {
      type: 'refresh',
      userId: payload.userId,
      sessionId: payload.sessionId,
      accessTokenId: payload.accessTokenId,
      familyId,
      iat: now,
      exp: now + TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
      jti,
      version: TOKEN_CONFIG.TOKEN_VERSION,
    };

    const token = jwt.sign(tokenPayload, this.jwtSecret, {
      algorithm: TOKEN_CONFIG.JWT_ALGORITHM,
      issuer: this.issuer,
      audience: 'zignal-app',
    });

    return { token, decoded: tokenPayload };
  }

  /**
   * Create initial token pair for new session
   */
  public createTokenPair(payload: {
    userId: string;
    sessionId: string;
    permissions?: string[];
  }): TokenPair {
    // Create access token first
    const { token: accessToken, decoded: accessDecoded } = this.createAccessToken(payload);

    // Create refresh token bound to access token
    const { token: refreshToken } = this.createRefreshToken({
      userId: payload.userId,
      sessionId: payload.sessionId,
      accessTokenId: accessDecoded.jti,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
      refreshExpiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    };
  }

  /**
   * Validate and decode JWT token
   */
  public validateToken(token: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: [TOKEN_CONFIG.JWT_ALGORITHM],
        issuer: this.issuer,
        audience: 'zignal-app',
      }) as AccessToken | RefreshToken;

      // Check token version compatibility
      if (!decoded.version || decoded.version !== TOKEN_CONFIG.TOKEN_VERSION) {
        return {
          valid: false,
          error: 'Token version mismatch',
        };
      }

      // Check if token should be refreshed (for access tokens)
      let shouldRefresh = false;
      if (decoded.type === 'access') {
        const timeUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000);
        shouldRefresh = timeUntilExpiry <= TOKEN_CONFIG.REFRESH_BEFORE_EXPIRY;
      }

      return {
        valid: true,
        decoded,
        shouldRefresh,
      };
    } catch (error) {
      let errorMessage = 'Token validation failed';
      
      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = 'Token expired';
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = 'Invalid token';
      } else if (error instanceof jwt.NotBeforeError) {
        errorMessage = 'Token not active';
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Rotate tokens using refresh token
   */
  public async rotateTokens(
    refreshToken: string,
    tokenStore: any // Will be injected from refresh token store
  ): Promise<{ success: boolean; tokens?: TokenPair; error?: string }> {
    try {
      // Validate refresh token
      const validation = this.validateToken(refreshToken);
      if (!validation.valid || !validation.decoded) {
        return { success: false, error: validation.error };
      }

      const refreshDecoded = validation.decoded as RefreshToken;
      if (refreshDecoded.type !== 'refresh') {
        return { success: false, error: 'Invalid token type' };
      }

      // Check if token family is still valid
      const family = await tokenStore.getTokenFamily(refreshDecoded.familyId);
      if (!family || family.revoked) {
        return { success: false, error: 'Token family revoked' };
      }

      // Validate token chain
      if (!family.tokenChain.includes(refreshDecoded.jti)) {
        // Potential token theft - revoke entire family
        await tokenStore.revokeTokenFamily(
          refreshDecoded.familyId,
          'Suspicious token usage detected'
        );
        return { success: false, error: 'Token family compromised' };
      }

      // Create new token pair
      const newTokenPair = this.createTokenPair({
        userId: refreshDecoded.userId,
        sessionId: refreshDecoded.sessionId,
        permissions: ['user'], // Get from user profile or store
      });

      // Update token family chain
      const { decoded: newRefreshDecoded } = this.createRefreshToken({
        userId: refreshDecoded.userId,
        sessionId: refreshDecoded.sessionId,
        accessTokenId: newTokenPair.accessToken.split('.')[2], // Get JTI from access token
        familyId: refreshDecoded.familyId,
      });

      // Update the refresh token in the pair
      newTokenPair.refreshToken = jwt.sign(newRefreshDecoded, this.jwtSecret, {
        algorithm: TOKEN_CONFIG.JWT_ALGORITHM,
        issuer: this.issuer,
        audience: 'zignal-app',
      });

      // Update token store
      await tokenStore.updateTokenFamily(refreshDecoded.familyId, {
        lastUsed: Date.now(),
        tokenChain: [...family.tokenChain, newRefreshDecoded.jti].slice(-TOKEN_CONFIG.MAX_FAMILY_CHAIN_LENGTH),
      });

      // Invalidate old refresh token
      await tokenStore.invalidateToken(refreshDecoded.jti);

      return { success: true, tokens: newTokenPair };
    } catch (error) {
      console.error('Token rotation error:', error);
      return { success: false, error: 'Token rotation failed' };
    }
  }

  /**
   * Extract token from Authorization header
   */
  public extractTokenFromHeader(request: NextRequest): string | null {
    // Check if request and headers exist
    if (!request || !request.headers || typeof request.headers.get !== 'function') {
      return null;
    }
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generate secure token hash for storage
   */
  public hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check if token needs refresh
   */
  public shouldRefreshToken(token: string): boolean {
    const validation = this.validateToken(token);
    return validation.valid && validation.shouldRefresh === true;
  }

  /**
   * Revoke token family for security
   */
  public async revokeTokenFamily(
    familyId: string,
    reason: string,
    tokenStore: any
  ): Promise<void> {
    await tokenStore.revokeTokenFamily(familyId, reason);
  }

  /**
   * Clean up expired tokens
   */
  public async cleanupExpiredTokens(tokenStore: any): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await tokenStore.cleanupExpiredTokens(now);
  }

  /**
   * Get token information without validating signature (for debugging)
   */
  public decodeTokenUnsafe(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate CSRF-safe token binding
   */
  public generateTokenBinding(request: NextRequest): string {
    const userAgent = request.headers.get('user-agent') || '';
    const origin = request.headers.get('origin') || '';
    const bindingData = `${userAgent.substring(0, 100)}:${origin}`;
    return crypto.createHash('sha256').update(bindingData).digest('hex');
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();