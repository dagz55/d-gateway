import { NextRequest, NextResponse } from 'next/server';
import { tokenManager, TOKEN_CONFIG } from '@/lib/token-manager';
import { refreshTokenStore } from '@/lib/refresh-token-store';
import { tokenValidator } from '@/lib/token-validation';
import { logSecurityEvent } from '@/lib/session-security';
import { getClientIP } from '@/lib/auth-middleware';
import { withAuthRateLimiting } from '@/middleware/rate-limiting';

export async function POST(request: NextRequest) {
  // Apply rate limiting for refresh endpoint
  const rateLimitResponse = await withAuthRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Extract refresh token from request body or cookies
    let refreshToken: string | null = null;

    // Try to get from request body first
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // If body parsing fails, try cookies
      const refreshTokenCookie = request.cookies.get('refresh_token');
      refreshToken = refreshTokenCookie?.value || null;
    }

    if (!refreshToken) {
      logSecurityEvent('csrf_token_validation_failed', {
        reason: 'No refresh token provided',
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
      });

      return NextResponse.json(
        { 
          error: 'No refresh token provided',
          code: 'REFRESH_TOKEN_REQUIRED' 
        },
        { status: 400 }
      );
    }

    // Validate refresh token structure and signature
    const validation = await tokenValidator.validateRefreshToken(refreshToken, {
      validateFamily: true,
    });

    if (!validation.valid) {
      logSecurityEvent('csrf_token_validation_failed', {
        reason: validation.error || 'Invalid refresh token',
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
      });

      return NextResponse.json(
        { 
          error: validation.error || 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Rotate tokens using the refresh token
    const rotationResult = await tokenManager.rotateTokens(refreshToken, refreshTokenStore);

    if (!rotationResult.success || !rotationResult.tokens) {
      logSecurityEvent('csrf_token_validation_failed', {
        reason: rotationResult.error || 'Token rotation failed',
        userId: validation.userId,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
      });

      return NextResponse.json(
        { 
          error: rotationResult.error || 'Token rotation failed',
          code: 'TOKEN_ROTATION_FAILED' 
        },
        { status: 401 }
      );
    }

    const newTokens = rotationResult.tokens;

    // Log successful token rotation
    logSecurityEvent('csrf_token_rotated', {
      userId: validation.userId,
      sessionId: validation.sessionId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
    });

    // Prepare response with new tokens
    const response = NextResponse.json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: newTokens.expiresIn,
      refreshExpiresIn: newTokens.refreshExpiresIn,
      tokenType: 'Bearer',
      rotated: true,
    });

    // Set secure HTTP-only cookies for the new tokens
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set access token cookie (shorter expiry)
    response.cookies.set('access_token', newTokens.accessToken, {
      ...cookieOptions,
      maxAge: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
    });

    // Set refresh token cookie (longer expiry)
    response.cookies.set('refresh_token', newTokens.refreshToken, {
      ...cookieOptions,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);

    logSecurityEvent('csrf_middleware_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
    });

    return NextResponse.json(
      { 
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint to check refresh token status
  try {
    const refreshTokenCookie = request.cookies.get('refresh_token');
    if (!refreshTokenCookie) {
      return NextResponse.json({
        hasRefreshToken: false,
        canRefresh: false,
      });
    }

    const validation = await tokenValidator.validateRefreshToken(
      refreshTokenCookie.value,
      { validateFamily: false } // Light validation for status check
    );

    return NextResponse.json({
      hasRefreshToken: true,
      canRefresh: validation.valid,
      expiresAt: validation.token?.exp ? validation.token.exp * 1000 : null,
    });

  } catch (error) {
    console.error('Refresh token status check error:', error);
    
    return NextResponse.json({
      hasRefreshToken: false,
      canRefresh: false,
      error: 'Status check failed',
    });
  }
}

export async function DELETE(request: NextRequest) {
  // DELETE endpoint to revoke refresh token
  try {
    const refreshTokenCookie = request.cookies.get('refresh_token');
    if (!refreshTokenCookie) {
      return NextResponse.json(
        { error: 'No refresh token to revoke' },
        { status: 400 }
      );
    }

    // Validate and get refresh token info
    const validation = await tokenValidator.validateRefreshToken(
      refreshTokenCookie.value,
      { validateFamily: true }
    );

    if (validation.valid && validation.token) {
      // Revoke the token family
      await refreshTokenStore.revokeTokenFamily(
        validation.token.familyId,
        'User requested token revocation'
      );

      logSecurityEvent('csrf_tokens_cleared', {
        userId: validation.userId,
        sessionId: validation.sessionId,
        reason: 'User revocation',
        ipAddress: getClientIP(request),
      });
    }

    // Clear cookies regardless of token validity
    const response = NextResponse.json({ revoked: true });
    
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;

  } catch (error) {
    console.error('Token revocation error:', error);
    
    return NextResponse.json(
      { error: 'Token revocation failed' },
      { status: 500 }
    );
  }
}