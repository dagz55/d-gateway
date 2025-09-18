import { NextRequest, NextResponse } from 'next/server';
import { withAPIAuth } from '@/lib/auth-middleware';
import { sessionManager } from '@/lib/session-manager';
import { deviceManager } from '@/lib/device-manager';

/**
 * GET /api/auth/sessions
 * Get user's active sessions
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeDevices = searchParams.get('include_devices') === 'true';
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Get user sessions
    const sessions = await sessionManager.getUserSessions(auth.user.id);
    
    // Enhance sessions with device information if requested
    let enhancedSessions = sessions;
    if (includeDevices) {
      const devices = await deviceManager.getUserDevices(auth.user.id, includeInactive);
      const deviceMap = new Map(devices.map(d => [d.deviceId, d]));
      
      enhancedSessions = sessions.map(session => ({
        ...session,
        device: deviceMap.get(session.deviceId),
      }));
    }

    // Filter active/inactive sessions
    if (!includeInactive) {
      enhancedSessions = enhancedSessions.filter(s => s.isActive);
    }

    return NextResponse.json({
      sessions: enhancedSessions,
      total: enhancedSessions.length,
      metadata: {
        includeDevices,
        includeInactive,
      },
    });

  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/sessions
 * Create a new session (typically handled by login, but can be used for session refresh)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { permissions = ['user'] } = body;

    // Create new session
    const session = await sessionManager.createSession(
      auth.user.id,
      request,
      permissions
    );

    // Register device
    const device = await deviceManager.registerDevice(auth.user.id, request);

    return NextResponse.json({
      session: {
        ...session,
        device,
      },
      message: 'Session created successfully',
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/sessions
 * Update session activity (heartbeat)
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate session belongs to user
    const sessionValidation = await sessionManager.validateSession(sessionId);
    if (!sessionValidation.valid || sessionValidation.session?.userId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 403 }
      );
    }

    // Update session activity
    await sessionManager.updateSessionActivity(sessionId, request);

    return NextResponse.json({
      message: 'Session activity updated',
      lastActivity: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions
 * Invalidate all sessions for the user
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const excludeCurrent = searchParams.get('exclude_current') === 'true';
    const currentSessionId = searchParams.get('current_session_id');

    if (excludeCurrent && currentSessionId) {
      // Invalidate all except current session
      await sessionManager.invalidateAllSessionsExcept(
        auth.user.id,
        currentSessionId,
        'user_logout',
        auth.user.id
      );
    } else {
      // Invalidate all sessions
      await sessionManager.invalidateAllSessions(
        auth.user.id,
        'user_logout',
        auth.user.id
      );
    }

    return NextResponse.json({
      message: 'Sessions invalidated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate sessions' },
      { status: 500 }
    );
  }
}