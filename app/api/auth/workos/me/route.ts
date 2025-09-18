import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-middleware';
import { withAPIRateLimiting } from '@/middleware/rate-limiting';

export async function GET(request: NextRequest) {
  // Apply API-specific rate limiting
  const rateLimitResponse = await withAPIRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      // Don't log 401s as they're expected for unauthenticated requests
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}