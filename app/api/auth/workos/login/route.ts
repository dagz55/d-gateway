import { NextRequest, NextResponse } from 'next/server';
import { workosAuthService, getAuthorizationUrl, checkWorkOSHealth } from '@/lib/workos-auth-service';
import { workosConfig } from '@/lib/workos';
import { withAuthRateLimiting } from '@/middleware/rate-limiting';
import { logAuthEvent, logSecurityEvent } from '@/lib/security-logger';

export async function GET(request: NextRequest) {
  // Apply authentication-specific rate limiting
  const rateLimitResponse = await withAuthRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Check WorkOS service health first
    const healthCheck = await checkWorkOSHealth();
    if (healthCheck.status === 'unhealthy') {
      throw new Error(`WorkOS service unhealthy: ${healthCheck.message}`);
    }

    // Log authentication attempt
    await logAuthEvent('auth_login_success', {
      request,
      message: 'WorkOS authentication initiated',
      metadata: {
        provider: 'workos',
        authFlow: 'oauth',
        redirectTarget: '/api/auth/workos/callback',
        authKitDomain: workosConfig.domains.authKit,
      },
    });

    // Generate state parameter for security
    const state = crypto.randomUUID();

    // Get authorization URL using the new service
    const authorizationUrl = getAuthorizationUrl(state);

    // Store state in session/cookie for validation (simplified for demo)
    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set('workos_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Log successful authorization URL generation
    await logAuthEvent('auth_login_success', {
      request,
      message: 'WorkOS authorization URL generated successfully',
      metadata: {
        provider: 'authkit',
        clientId: workosConfig.clientId,
        authKitUrl: workosConfig.authKitUrl,
        baseUrl: workosConfig.baseUrl,
        authUrlGenerated: true,
      },
      customSeverity: 'low',
    });

    return response;
  } catch (error) {
    console.error('WorkOS login error:', error);
    
    // Log authentication system error
    await logAuthEvent('auth_login_failure', {
      request,
      message: 'WorkOS login configuration error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'workos',
        configurationValid: false,
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      },
    });
    
    // If there's an error, redirect to the login page with an error message
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'workos_configuration_error');
    return NextResponse.redirect(url);
  }
}