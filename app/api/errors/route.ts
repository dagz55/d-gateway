import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

interface ErrorLogData {
  id: string;
  message: string;
  stack?: string;
  type: 'network' | 'component' | 'data' | 'api' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: {
    component?: string;
    action?: string;
    userId?: string;
    sessionId?: string;
    timestamp?: number;
    userAgent?: string;
    url?: string;
    additionalData?: Record<string, any>;
  };
  timestamp: number;
  resolved: boolean;
  retryCount: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get user information (optional for error logging)
    let user = null;
    try {
      user = await getCurrentUser();
    } catch (error) {
      // Continue without user info if auth fails
      console.warn('Could not get user for error logging:', error);
    }

    const errorData: ErrorLogData = await request.json();

    // Validate error data
    if (!errorData.id || !errorData.message || !errorData.type) {
      return NextResponse.json(
        { error: 'Invalid error data format' },
        { status: 400 }
      );
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Logged:', {
        id: errorData.id,
        message: errorData.message,
        type: errorData.type,
        severity: errorData.severity,
        component: errorData.context.component,
        action: errorData.context.action,
        userId: user?.id,
        timestamp: new Date(errorData.timestamp).toISOString(),
      });
    }

    // Store in database if available
    try {
      const supabase = await createServerSupabaseClient();
      
      // Check if error_logs table exists
      const { data: tableExists } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'error_logs')
        .single();

      if (tableExists) {
        const { error: insertError } = await supabase
          .from('error_logs')
          .insert({
            id: errorData.id,
            message: errorData.message,
            stack: errorData.stack,
            type: errorData.type,
            severity: errorData.severity,
            context: errorData.context,
            user_id: user?.id || null,
            resolved: errorData.resolved,
            retry_count: errorData.retryCount,
            created_at: new Date(errorData.timestamp).toISOString(),
          });

        if (insertError) {
          console.error('Failed to insert error log:', insertError);
        }
      }
    } catch (dbError) {
      console.error('Database error during error logging:', dbError);
      // Continue execution - don't fail the error logging request
    }

    // Send notifications for critical errors
    if (errorData.severity === 'critical' || 
        (errorData.severity === 'high' && errorData.type === 'api')) {
      try {
        await sendCriticalErrorNotification(errorData, user);
      } catch (notifyError) {
        console.warn('Failed to send critical error notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully',
      errorId: errorData.id,
    });

  } catch (error) {
    console.error('Error in error logging endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to log error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('clerk_user_id', user.id)
      .single();

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const resolved = searchParams.get('resolved');

    // Check if error_logs table exists
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'error_logs')
      .single();

    if (!tableExists) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { limit, offset, count: 0 },
        note: 'Error logs table not yet implemented',
      });
    }

    // Build query
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data: errors, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error querying error logs:', queryError);
      return NextResponse.json(
        { error: 'Failed to retrieve error logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: errors || [],
      pagination: {
        limit,
        offset,
        count: count || 0,
      },
    });

  } catch (error) {
    console.error('Error retrieving error logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve error logs' },
      { status: 500 }
    );
  }
}

// Helper function to send critical error notifications
async function sendCriticalErrorNotification(errorData: ErrorLogData, user: any) {
  // This could be implemented with email, Slack, Discord, etc.
  // For now, we'll just log it
  
  const notification = {
    type: 'critical_error',
    errorId: errorData.id,
    message: errorData.message,
    severity: errorData.severity,
    type: errorData.type,
    component: errorData.context.component,
    action: errorData.context.action,
    userId: user?.id,
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    timestamp: new Date(errorData.timestamp).toISOString(),
    url: errorData.context.url,
    userAgent: errorData.context.userAgent,
  };

  console.error('CRITICAL ERROR NOTIFICATION:', notification);

  // TODO: Implement actual notification sending
  // Examples:
  // - Send email to admin team
  // - Send Slack message
  // - Send Discord webhook
  // - Send SMS for critical errors
}
