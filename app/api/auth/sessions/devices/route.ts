import { NextRequest, NextResponse } from 'next/server';
import { withAPIAuth } from '@/lib/auth-middleware';
import { deviceManager } from '@/lib/device-manager';
import { sessionManager } from '@/lib/session-manager';

/**
 * GET /api/auth/sessions/devices
 * Get user's devices and their session information
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const includeSessions = searchParams.get('include_sessions') === 'true';
    const targetUserId = searchParams.get('user_id');

    const userId = targetUserId || auth.user.id;

    // Check permissions for accessing other users' devices
    if (targetUserId && targetUserId !== auth.user.id) {
      if (!auth.user.permissions?.includes('admin')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Get user devices
    const devices = await deviceManager.getUserDevices(userId, includeInactive);

    // Enhance devices with session information if requested
    let enhancedDevices = devices;
    if (includeSessions) {
      // Define a type for the session object for stronger typing
      interface Session {
        deviceId: string;
        isActive: boolean;
        // Add other session properties as needed
      }

      const sessions: Session[] = await sessionManager.getUserSessions(userId);
      const sessionsByDevice = new Map<string, Session[]>();
      
      sessions.forEach(session => {
        const deviceSessions = sessionsByDevice.get(session.deviceId) || [];
        deviceSessions.push(session);
        sessionsByDevice.set(session.deviceId, deviceSessions);
      });

      enhancedDevices = devices.map(device => ({
        ...device,
        sessions: sessionsByDevice.get(device.deviceId) || [],
        activeSessionCount: (sessionsByDevice.get(device.deviceId) || []).filter((s: Session) => s.isActive).length,
      }));
    }

    // Check for suspicious activity
    const suspiciousActivity = await deviceManager.detectSuspiciousActivity(userId);

    return NextResponse.json({
      devices: enhancedDevices,
      total: enhancedDevices.length,
      trustedCount: enhancedDevices.filter(d => d.isTrusted).length,
      activeCount: enhancedDevices.filter(d => d.isActive).length,
      suspiciousActivity,
      metadata: {
        includeInactive,
        includeSessions,
        userId,
      },
    });

  } catch (error) {
    console.error('Devices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/sessions/devices
 * Register a new device or update existing device information
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fingerprint, metadata = {} } = body;

    // Register device with current request information
    const device = await deviceManager.registerDevice(auth.user.id, request);

    // Check if device verification is required
    const requiresVerification = await deviceManager.requiresVerification(
      device.deviceId,
      auth.user.id
    );

    let verificationRequest = null;
    if (requiresVerification) {
      verificationRequest = await deviceManager.initiateDeviceVerification(
        device.deviceId,
        auth.user.id,
        'email'
      );
    }

    return NextResponse.json({
      device,
      requiresVerification,
      verificationRequest: verificationRequest ? {
        deviceId: verificationRequest.deviceId,
        verificationMethod: verificationRequest.verificationMethod,
        expiresAt: verificationRequest.expiresAt,
      } : null,
      message: requiresVerification ? 
        'Device registered successfully. Verification required.' :
        'Device registered successfully.',
    });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/sessions/devices
 * Update device information or trust status
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, action, targetUserId, verificationCode } = body;

    if (!deviceId || !action) {
      return NextResponse.json(
        { error: 'Device ID and action are required' },
        { status: 400 }
      );
    }

    const userId = targetUserId || auth.user.id;

    // Check permissions for modifying other users' devices
    if (targetUserId && targetUserId !== auth.user.id) {
      if (!auth.user.permissions?.includes('admin')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    const result: any = {};
    let message = '';

    switch (action) {
      case 'trust':
        await deviceManager.trustDevice(deviceId, userId, auth.user.id);
        message = 'Device trusted successfully';
        break;

      case 'revoke_trust':
        await deviceManager.revokeTrust(deviceId, userId, auth.user.id);
        message = 'Device trust revoked successfully';
        break;

      case 'verify':
        if (!verificationCode) {
          return NextResponse.json(
            { error: 'Verification code is required' },
            { status: 400 }
          );
        }
        
        const verified = await deviceManager.verifyDevice(
          deviceId,
          userId,
          verificationCode
        );
        
        if (!verified) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          );
        }
        
        message = 'Device verified successfully';
        result.verified = true;
        break;

      case 'deactivate':
        await deviceManager.deactivateDevice(
          deviceId,
          userId,
          'User requested deactivation'
        );
        message = 'Device deactivated successfully';
        break;

      case 'request_verification':
        const verificationMethod = body.verificationMethod || 'email';
        const verificationRequest = await deviceManager.initiateDeviceVerification(
          deviceId,
          userId,
          verificationMethod
        );
        
        result.verificationRequest = {
          deviceId: verificationRequest.deviceId,
          verificationMethod: verificationRequest.verificationMethod,
          expiresAt: verificationRequest.expiresAt,
        };
        message = 'Verification code sent successfully';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...result,
      message,
      deviceId,
      action,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Device update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update device',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions/devices
 * Remove device and invalidate its sessions
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    const targetUserId = searchParams.get('user_id');
    const invalidateSessions = searchParams.get('invalidate_sessions') !== 'false';

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const userId = targetUserId || auth.user.id;

    // Check permissions for deleting other users' devices
    if (targetUserId && targetUserId !== auth.user.id) {
      if (!auth.user.permissions?.includes('admin')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Get device sessions before deletion
    let invalidatedSessionCount = 0;
    if (invalidateSessions) {
      const sessions = await sessionManager.getUserSessions(userId);
      const deviceSessions = sessions
        .filter(s => s.deviceId === deviceId && s.isActive)
        .map(s => s.sessionId);
      
      if (deviceSessions.length > 0) {
        await sessionManager.invalidateSessions(
          userId,
          deviceSessions,
          'device_change',
          auth.user.id,
          { reason: 'Device removed by user' }
        );
        invalidatedSessionCount = deviceSessions.length;
      }
    }

    // Deactivate the device
    await deviceManager.deactivateDevice(
      deviceId,
      userId,
      'Device removed by user'
    );

    return NextResponse.json({
      message: 'Device removed successfully',
      deviceId,
      invalidatedSessionCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Device deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove device' },
      { status: 500 }
    );
  }
}
