import { NextRequest, NextResponse } from 'next/server';
import { withAPIAuth } from '@/lib/auth-middleware';
import { sessionManager } from '@/lib/session-manager';
import { sessionInvalidationManager, InvalidationTrigger } from '@/lib/session-invalidation';

/**
 * POST /api/auth/sessions/invalidate
 * Invalidate specific sessions or trigger invalidation based on rules
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionIds,
      trigger,
      reason,
      targetUserId,
      currentSessionId,
      graceful = true,
      notify = true,
      metadata = {},
    } = body;

    // Validate required fields
    if (!sessionIds && !trigger) {
      return NextResponse.json(
        { error: 'Either sessionIds or trigger must be provided' },
        { status: 400 }
      );
    }

    const userId = targetUserId || auth.user.id;
    
    // Check if user can invalidate sessions for target user
    if (targetUserId && targetUserId !== auth.user.id) {
      // Only admins can invalidate other users' sessions
      if (!auth.user.permissions?.includes('admin')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    let result;

    if (sessionIds && sessionIds.length > 0) {
      // Direct session invalidation
      const mappedReason = reason || 'admin_action';
      
      // Validate session ownership for non-admin users
      if (!auth.user.permissions?.includes('admin')) {
        const userSessions = await sessionManager.getUserSessions(userId);
        const userSessionIds = userSessions.map(s => s.sessionId);
        const invalidSessionIds = sessionIds.filter((id: string) => !userSessionIds.includes(id));
        
        if (invalidSessionIds.length > 0) {
          return NextResponse.json(
            { error: 'Cannot invalidate sessions that do not belong to you' },
            { status: 403 }
          );
        }
      }

      await sessionManager.invalidateSessions(
        userId,
        sessionIds,
        mappedReason,
        auth.user.id,
        metadata
      );

      result = {
        success: true,
        invalidatedCount: sessionIds.length,
        method: 'direct',
      };
    } else if (trigger) {
      // Rule-based invalidation
      result = await sessionInvalidationManager.triggerInvalidation(
        userId,
        trigger as InvalidationTrigger,
        auth.user.id,
        {
          currentSessionId,
          gracefulShutdown: graceful,
          notifyUser: notify,
          metadata,
        }
      );

      (result as any).method = 'rule-based';
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Session invalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to invalidate sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/sessions/invalidate
 * Get invalidation history and pending invalidations
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');
    const includeHistory = searchParams.get('include_history') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const userId = targetUserId || auth.user.id;

    // Check permissions for accessing other users' data
    if (targetUserId && targetUserId !== auth.user.id) {
      if (!auth.user.permissions?.includes('admin')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    const result: any = {
      userId,
      timestamp: new Date().toISOString(),
    };

    // Get pending graceful invalidations
    const { data: pendingInvalidations } = await sessionInvalidationManager['supabase']
      .from('graceful_invalidation_schedule')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .order('execute_at', { ascending: true })
      .limit(10);

    result.pendingInvalidations = pendingInvalidations || [];

    // Get invalidation history if requested
    if (includeHistory) {
      const { data: invalidationHistory } = await sessionInvalidationManager['supabase']
        .from('session_invalidation_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      result.invalidationHistory = invalidationHistory || [];
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Invalidation history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invalidation data' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/sessions/invalidate
 * Update or cancel pending invalidations
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invalidationId, action, delayMinutes } = body;

    if (!invalidationId || !action) {
      return NextResponse.json(
        { error: 'Invalidation ID and action are required' },
        { status: 400 }
      );
    }

    // Get the invalidation schedule
    const { data: invalidation } = await sessionInvalidationManager['supabase']
      .from('graceful_invalidation_schedule')
      .select('*')
      .eq('id', invalidationId)
      .eq('status', 'scheduled')
      .single();

    if (!invalidation) {
      return NextResponse.json(
        { error: 'Invalidation not found or already processed' },
        { status: 404 }
      );
    }

    // Check permissions
    if (invalidation.user_id !== auth.user.id && !auth.user.permissions?.includes('admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'cancel':
        updateData = {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: auth.user.id,
        };
        message = 'Invalidation cancelled successfully';
        break;

      case 'delay':
        if (!delayMinutes || delayMinutes < 1 || delayMinutes > 60) {
          return NextResponse.json(
            { error: 'Delay must be between 1 and 60 minutes' },
            { status: 400 }
          );
        }
        
        const newExecuteAt = new Date(Date.now() + delayMinutes * 60 * 1000);
        updateData = {
          execute_at: newExecuteAt.toISOString(),
          delayed_at: new Date().toISOString(),
          delayed_by: auth.user.id,
          delay_reason: `Delayed by ${delayMinutes} minutes by user request`,
        };
        message = `Invalidation delayed by ${delayMinutes} minutes`;
        break;

      case 'execute_now':
        // Process the invalidation immediately
        await sessionManager.invalidateSessions(
          invalidation.user_id,
          invalidation.session_ids,
          invalidation.trigger,
          auth.user.id
        );

        updateData = {
          status: 'executed',
          executed_at: new Date().toISOString(),
          execution_note: 'Executed immediately by user request',
        };
        message = 'Invalidation executed immediately';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the invalidation schedule
    const { error } = await sessionInvalidationManager['supabase']
      .from('graceful_invalidation_schedule')
      .update(updateData)
      .eq('id', invalidationId);

    if (error) {
      console.error('Failed to update invalidation schedule:', error);
      return NextResponse.json(
        { error: 'Failed to update invalidation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message,
      invalidationId,
      action,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Invalidation update error:', error);
    return NextResponse.json(
      { error: 'Failed to update invalidation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions/invalidate
 * Clear invalidation history (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAPIAuth(request, { requiredPermissions: ['admin'] });
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '30');

    if (olderThanDays < 1) {
      return NextResponse.json(
        { error: 'older_than_days must be at least 1' },
        { status: 400 }
      );
    }

    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    let query = sessionInvalidationManager['supabase']
      .from('session_invalidation_events')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error, count } = await query;

    if (error) {
      console.error('Failed to clear invalidation history:', error);
      return NextResponse.json(
        { error: 'Failed to clear history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Invalidation history cleared',
      deletedCount: count || 0,
      cutoffDate: cutoffDate.toISOString(),
    });

  } catch (error) {
    console.error('History cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}