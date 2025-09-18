/**
 * Security Events API
 * API endpoint for retrieving and managing security events
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminRateLimiting } from '@/middleware/rate-limiting';
import { securityAnalytics } from '@/lib/security-analytics';
import { securityLogger } from '@/lib/security-logger';
import { 
  SecurityEventFilter, 
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity 
} from '@/lib/security-events';

export async function GET(request: NextRequest) {
  // Apply admin-specific rate limiting
  const rateLimitResponse = await withAdminRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Log admin access to security events
    await securityLogger.logEvent('admin_data_access', {
      request,
      message: 'Admin accessed security events API',
      metadata: {
        endpoint: '/api/admin/security/events',
        action: 'view_security_events',
      },
    });

    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const filter: SecurityEventFilter = {
      eventTypes: searchParams.get('eventTypes')?.split(',') as SecurityEventType[] || undefined,
      severities: searchParams.get('severities')?.split(',') as SecurityEventSeverity[] || undefined,
      userIds: searchParams.get('userIds')?.split(',') || undefined,
      ipAddresses: searchParams.get('ipAddresses')?.split(',') || undefined,
      timeRange: searchParams.get('startTime') && searchParams.get('endTime') ? {
        start: searchParams.get('startTime')!,
        end: searchParams.get('endTime')!,
      } : undefined,
      threatScoreMin: searchParams.get('threatScoreMin') ? 
        parseInt(searchParams.get('threatScoreMin')!) : undefined,
      threatScoreMax: searchParams.get('threatScoreMax') ? 
        parseInt(searchParams.get('threatScoreMax')!) : undefined,
      requiresAction: searchParams.get('requiresAction') === 'true' ? true : 
        searchParams.get('requiresAction') === 'false' ? false : undefined,
      processed: searchParams.get('processed') === 'true' ? true : 
        searchParams.get('processed') === 'false' ? false : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: (searchParams.get('sortBy') as 'timestamp' | 'severity' | 'threatScore') || 'timestamp',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate limit
    if (filter.limit && filter.limit > 1000) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 1000 events' },
        { status: 400 }
      );
    }

    // Get security events
    const events = await securityAnalytics.getSecurityEvents(filter);

    // Get total count for pagination
    const totalCount = await getTotalEventsCount(filter);

    // Prepare response
    const response = {
      events,
      pagination: {
        total: totalCount,
        limit: filter.limit || 50,
        offset: filter.offset || 0,
        hasMore: totalCount > (filter.offset || 0) + (filter.limit || 50),
      },
      filter: filter,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Security events API error:', error);
    
    // Log the error
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security events API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/events',
      },
    });

    return NextResponse.json(
      { error: 'Failed to retrieve security events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply admin-specific rate limiting
  const rateLimitResponse = await withAdminRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { action, eventIds, updates } = body;

    // Log admin action
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin performed bulk action: ${action}`,
      metadata: {
        endpoint: '/api/admin/security/events',
        action,
        eventIds: eventIds?.length || 0,
        updates,
      },
    });

    switch (action) {
      case 'acknowledge':
        await acknowledgeEvents(eventIds);
        break;
      
      case 'resolve':
        await resolveEvents(eventIds);
        break;
      
      case 'update':
        await updateEvents(eventIds, updates);
        break;
      
      case 'delete':
        await deleteEvents(eventIds);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${action} completed successfully`,
      affectedEvents: eventIds?.length || 0,
    });

  } catch (error) {
    console.error('Security events POST error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security events POST API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/events',
      },
    });

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Apply admin-specific rate limiting
  const rateLimitResponse = await withAdminRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { eventId, updates } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Log admin modification
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin updated security event: ${eventId}`,
      metadata: {
        endpoint: '/api/admin/security/events',
        action: 'update_event',
        eventId,
        updates,
      },
    });

    // Update the event
    await updateEvent(eventId, updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Event updated successfully',
      eventId,
    });

  } catch (error) {
    console.error('Security events PUT error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security events PUT API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/events',
      },
    });

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Apply admin-specific rate limiting
  const rateLimitResponse = await withAdminRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Log admin deletion
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin deleted security event: ${eventId}`,
      metadata: {
        endpoint: '/api/admin/security/events',
        action: 'delete_event',
        eventId,
      },
    });

    // Delete the event
    await deleteEvent(eventId);

    return NextResponse.json({ 
      success: true, 
      message: 'Event deleted successfully',
      eventId,
    });

  } catch (error) {
    console.error('Security events DELETE error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security events DELETE API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/events',
      },
    });

    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getTotalEventsCount(filter: SecurityEventFilter): Promise<number> {
  // This would implement the actual count query
  // For now, return a placeholder
  try {
    const events = await securityAnalytics.getSecurityEvents({
      ...filter,
      limit: undefined,
      offset: undefined,
    });
    return events.length;
  } catch (error) {
    console.error('Error getting total events count:', error);
    return 0;
  }
}

async function acknowledgeEvents(eventIds: string[]): Promise<void> {
  // This would implement the actual acknowledge logic
  console.log('Acknowledging events:', eventIds);
  // In a real implementation, this would update the database
}

async function resolveEvents(eventIds: string[]): Promise<void> {
  // This would implement the actual resolve logic
  console.log('Resolving events:', eventIds);
  // In a real implementation, this would update the database
}

async function updateEvents(eventIds: string[], updates: any): Promise<void> {
  // This would implement the actual update logic
  console.log('Updating events:', eventIds, 'with:', updates);
  // In a real implementation, this would update the database
}

async function updateEvent(eventId: string, updates: any): Promise<void> {
  // This would implement the actual single event update logic
  console.log('Updating event:', eventId, 'with:', updates);
  // In a real implementation, this would update the database
}

async function deleteEvents(eventIds: string[]): Promise<void> {
  // This would implement the actual delete logic
  console.log('Deleting events:', eventIds);
  // In a real implementation, this would delete from the database
}

async function deleteEvent(eventId: string): Promise<void> {
  // This would implement the actual single event delete logic
  console.log('Deleting event:', eventId);
  // In a real implementation, this would delete from the database
}