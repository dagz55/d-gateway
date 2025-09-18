/**
 * Security Alerts API
 * API endpoint for managing security alerts and notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminRateLimiting } from '@/middleware/rate-limiting';
import { securityLogger } from '@/lib/security-logger';
import { securityAnalytics } from '@/lib/security-analytics';
import { SecurityAlert, SecurityEventSeverity } from '@/lib/security-events';

export async function GET(request: NextRequest) {
  // Apply admin-specific rate limiting
  const rateLimitResponse = await withAdminRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Log admin access to security alerts
    await securityLogger.logEvent('admin_data_access', {
      request,
      message: 'Admin accessed security alerts API',
      metadata: {
        endpoint: '/api/admin/security/alerts',
        action: 'view_security_alerts',
      },
    });

    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const filters = {
      severity: searchParams.get('severity') as SecurityEventSeverity | null,
      status: searchParams.get('status') || 'all', // 'active', 'acknowledged', 'resolved', 'all'
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      timeRange: searchParams.get('timeRange') || '24h',
    };

    // Validate limit
    if (filters.limit > 500) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 500 alerts' },
        { status: 400 }
      );
    }

    // Get alerts based on filters
    const alerts = await getSecurityAlerts(filters);
    const totalCount = await getAlertsCount(filters);

    // Get alert statistics
    const statistics = await getAlertStatistics(filters.timeRange);

    const response = {
      alerts,
      statistics,
      pagination: {
        total: totalCount,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: totalCount > filters.offset + filters.limit,
      },
      filters,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Security alerts API error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security alerts API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/alerts',
      },
    });

    return NextResponse.json(
      { error: 'Failed to retrieve security alerts' },
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
    const { action, alertIds, data } = body;

    // Log admin action
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin performed alert action: ${action}`,
      metadata: {
        endpoint: '/api/admin/security/alerts',
        action,
        alertIds: alertIds?.length || 0,
        data,
      },
    });

    let result;

    switch (action) {
      case 'acknowledge':
        result = await acknowledgeAlerts(alertIds);
        break;
      
      case 'resolve':
        result = await resolveAlerts(alertIds);
        break;
      
      case 'escalate':
        result = await escalateAlerts(alertIds, data);
        break;
      
      case 'create':
        result = await createManualAlert(data);
        break;
      
      case 'snooze':
        result = await snoozeAlerts(alertIds, data.duration);
        break;
      
      case 'test':
        result = await sendTestAlert(data);
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
      result,
    });

  } catch (error) {
    console.error('Security alerts POST error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security alerts POST API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/alerts',
      },
    });

    return NextResponse.json(
      { error: 'Failed to process alert action' },
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
    const { alertId, updates } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Log admin modification
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin updated security alert: ${alertId}`,
      metadata: {
        endpoint: '/api/admin/security/alerts',
        action: 'update_alert',
        alertId,
        updates,
      },
    });

    // Update the alert
    const updatedAlert = await updateAlert(alertId, updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Alert updated successfully',
      alert: updatedAlert,
    });

  } catch (error) {
    console.error('Security alerts PUT error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security alerts PUT API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/alerts',
      },
    });

    return NextResponse.json(
      { error: 'Failed to update alert' },
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
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Log admin deletion
    await securityLogger.logEvent('admin_system_modification', {
      request,
      message: `Admin deleted security alert: ${alertId}`,
      metadata: {
        endpoint: '/api/admin/security/alerts',
        action: 'delete_alert',
        alertId,
      },
    });

    // Delete the alert
    await deleteAlert(alertId);

    return NextResponse.json({ 
      success: true, 
      message: 'Alert deleted successfully',
      alertId,
    });

  } catch (error) {
    console.error('Security alerts DELETE error:', error);
    
    await securityLogger.logEvent('security_alert_triggered', {
      request,
      message: 'Error in security alerts DELETE API',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/admin/security/alerts',
      },
    });

    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getSecurityAlerts(filters: any): Promise<SecurityAlert[]> {
  // This would implement the actual database query
  // For now, return mock data
  const mockAlerts: SecurityAlert[] = [
    {
      id: 'alert-1',
      eventId: 'event-1',
      alertType: 'slack',
      title: 'Brute Force Attack Detected',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      severity: 'high',
      recipients: ['security@company.com'],
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      escalated: false,
      resolved: false,
      metadata: {
        ipAddress: '192.168.1.100',
        attemptCount: 15,
        timeWindow: '5 minutes',
      },
    },
    {
      id: 'alert-2',
      eventId: 'event-2',
      alertType: 'email',
      title: 'CSRF Attack Detected',
      description: 'CSRF token validation failed multiple times',
      severity: 'critical',
      recipients: ['security@company.com', 'admin@company.com'],
      sentAt: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: true,
      acknowledgedBy: 'admin@company.com',
      acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
      escalated: false,
      resolved: false,
      metadata: {
        endpoint: '/api/auth/login',
        failureCount: 10,
      },
    },
  ];

  // Apply filters
  let filteredAlerts = mockAlerts;

  if (filters.severity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
  }

  if (filters.status !== 'all') {
    switch (filters.status) {
      case 'active':
        filteredAlerts = filteredAlerts.filter(alert => !alert.acknowledged && !alert.resolved);
        break;
      case 'acknowledged':
        filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged && !alert.resolved);
        break;
      case 'resolved':
        filteredAlerts = filteredAlerts.filter(alert => alert.resolved);
        break;
    }
  }

  // Apply pagination
  const start = filters.offset;
  const end = start + filters.limit;
  
  return filteredAlerts.slice(start, end);
}

async function getAlertsCount(filters: any): Promise<number> {
  // This would implement the actual count query
  // For now, return mock count
  return 25;
}

async function getAlertStatistics(timeRange: string): Promise<any> {
  // This would calculate real statistics
  return {
    total: 25,
    bySeverity: {
      low: 5,
      medium: 10,
      high: 8,
      critical: 2,
    },
    byStatus: {
      active: 15,
      acknowledged: 7,
      resolved: 3,
    },
    responseTime: {
      average: 180, // seconds
      median: 120,
      fastest: 30,
      slowest: 600,
    },
    trends: {
      increasing: false,
      changePercent: -5.2,
    },
  };
}

async function acknowledgeAlerts(alertIds: string[]): Promise<any> {
  // This would implement the actual acknowledge logic
  console.log('Acknowledging alerts:', alertIds);
  
  // Log each acknowledgment
  for (const alertId of alertIds) {
    await securityLogger.logEvent('admin_system_modification', {
      message: `Alert acknowledged: ${alertId}`,
      metadata: {
        action: 'acknowledge_alert',
        alertId,
        acknowledgedAt: new Date().toISOString(),
      },
    });
  }

  return {
    acknowledged: alertIds.length,
    timestamp: new Date().toISOString(),
  };
}

async function resolveAlerts(alertIds: string[]): Promise<any> {
  // This would implement the actual resolve logic
  console.log('Resolving alerts:', alertIds);
  
  // Log each resolution
  for (const alertId of alertIds) {
    await securityLogger.logEvent('admin_system_modification', {
      message: `Alert resolved: ${alertId}`,
      metadata: {
        action: 'resolve_alert',
        alertId,
        resolvedAt: new Date().toISOString(),
      },
    });
  }

  return {
    resolved: alertIds.length,
    timestamp: new Date().toISOString(),
  };
}

async function escalateAlerts(alertIds: string[], data: any): Promise<any> {
  // This would implement the actual escalation logic
  console.log('Escalating alerts:', alertIds, 'with data:', data);
  
  // Log each escalation
  for (const alertId of alertIds) {
    await securityLogger.logEvent('admin_system_modification', {
      message: `Alert escalated: ${alertId}`,
      metadata: {
        action: 'escalate_alert',
        alertId,
        escalationLevel: data.level,
        escalatedAt: new Date().toISOString(),
      },
    });
  }

  return {
    escalated: alertIds.length,
    level: data.level,
    timestamp: new Date().toISOString(),
  };
}

async function createManualAlert(data: any): Promise<any> {
  // This would implement manual alert creation
  console.log('Creating manual alert:', data);
  
  const alertId = `manual-${Date.now()}`;
  
  await securityLogger.logEvent('admin_system_modification', {
    message: `Manual alert created: ${alertId}`,
    metadata: {
      action: 'create_manual_alert',
      alertId,
      alertData: data,
      createdAt: new Date().toISOString(),
    },
  });

  return {
    alertId,
    created: true,
    timestamp: new Date().toISOString(),
  };
}

async function snoozeAlerts(alertIds: string[], duration: number): Promise<any> {
  // This would implement alert snoozing
  console.log('Snoozing alerts:', alertIds, 'for duration:', duration);
  
  const snoozeUntil = new Date(Date.now() + duration * 1000).toISOString();
  
  for (const alertId of alertIds) {
    await securityLogger.logEvent('admin_system_modification', {
      message: `Alert snoozed: ${alertId}`,
      metadata: {
        action: 'snooze_alert',
        alertId,
        duration,
        snoozeUntil,
      },
    });
  }

  return {
    snoozed: alertIds.length,
    duration,
    snoozeUntil,
    timestamp: new Date().toISOString(),
  };
}

async function sendTestAlert(data: any): Promise<any> {
  // This would implement test alert sending
  console.log('Sending test alert:', data);
  
  await securityLogger.logEvent('admin_system_modification', {
    message: 'Test alert sent',
    metadata: {
      action: 'send_test_alert',
      alertType: data.type,
      recipients: data.recipients,
      sentAt: new Date().toISOString(),
    },
  });

  return {
    sent: true,
    type: data.type,
    recipients: data.recipients,
    timestamp: new Date().toISOString(),
  };
}

async function updateAlert(alertId: string, updates: any): Promise<SecurityAlert> {
  // This would implement the actual update logic
  console.log('Updating alert:', alertId, 'with:', updates);
  
  await securityLogger.logEvent('admin_system_modification', {
    message: `Alert updated: ${alertId}`,
    metadata: {
      action: 'update_alert',
      alertId,
      updates,
      updatedAt: new Date().toISOString(),
    },
  });

  // Return mock updated alert
  return {
    id: alertId,
    eventId: 'event-1',
    alertType: 'slack',
    title: updates.title || 'Updated Alert',
    description: updates.description || 'Updated description',
    severity: updates.severity || 'medium',
    recipients: updates.recipients || ['security@company.com'],
    acknowledged: updates.acknowledged || false,
    escalated: updates.escalated || false,
    resolved: updates.resolved || false,
    metadata: updates.metadata || {},
  };
}

async function deleteAlert(alertId: string): Promise<void> {
  // This would implement the actual delete logic
  console.log('Deleting alert:', alertId);
  
  await securityLogger.logEvent('admin_system_modification', {
    message: `Alert deleted: ${alertId}`,
    metadata: {
      action: 'delete_alert',
      alertId,
      deletedAt: new Date().toISOString(),
    },
  });
}