import { NextRequest, NextResponse } from 'next/server';
import { workos, workosConfig, validateWorkOSConfig } from '@/lib/workos';
import { clearUserSession, logSecurityEvent, getClientIP } from '@/lib/auth-middleware';
import { withAuthRateLimiting } from '@/middleware/rate-limiting';

export async function GET(request: NextRequest) {
  // Apply authentication-specific rate limiting
  const rateLimitResponse = await withAuthRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Log security event for logout
    logSecurityEvent('session_cleared', {
      reason: 'User initiated logout',
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request)
    });

    // Clear the secure session cookies
    await clearUserSession();

    console.log('User logged out successfully');

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('WorkOS logout error:', error);
    
    // Log security event for logout error
    logSecurityEvent('session_cleared', {
      reason: 'Logout error - forced cleanup',
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request)
    });
    
    // If there's an error, still try to clear the cookies and redirect to home
    try {
      await clearUserSession();
    } catch (cookieError) {
      console.error('Error clearing session:', cookieError);
    }
    
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for logout (better security practice)
  return GET(request);
}