import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { getCurrentUser } from '@/lib/auth-middleware';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  errorId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Skip authentication during build time
    if (process.env.NODE_ENV === 'production' && !request.headers.get('user-agent')) {
      return NextResponse.json({ error: 'Build time execution' }, { status: 503 });
    }

    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('workos_user_id', user.id)
      .single();

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const errorData: ErrorLog = await request.json();

    // Validate error data
    if (!errorData.message || !errorData.timestamp || !errorData.errorId) {
      return NextResponse.json({ error: 'Invalid error data' }, { status: 400 });
    }

    // For now, we'll log to console and create a simplified error record
    console.error('Admin Panel Error Details:', {
      user_id: user.id,
      error_id: errorData.errorId,
      error_message: errorData.message,
      error_stack: errorData.stack,
      component_stack: errorData.componentStack,
      page_url: errorData.url,
      user_agent: errorData.userAgent,
      occurred_at: errorData.timestamp,
      severity: 'high',
      category: 'admin_panel',
      status: 'new'
    });

    // For now, we'll just log to console since error_logs table may not exist
    // TODO: Create error_logs table in future migration

    // Also log to console for development
    console.error('Admin Panel Error Logged:', {
      errorId: errorData.errorId,
      userId: user.id,
      message: errorData.message,
      url: errorData.url,
      timestamp: errorData.timestamp
    });

    // Send notification for critical admin errors (optional)
    if (errorData.message.toLowerCase().includes('critical') || 
        errorData.message.toLowerCase().includes('database') ||
        errorData.message.toLowerCase().includes('auth')) {
      
      try {
        await notifyAdminError(errorData, user);
      } catch (notifyError) {
        console.warn('Failed to send admin error notification:', notifyError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully',
      errorId: errorData.errorId 
    });

  } catch (error) {
    console.error('Error logging admin error:', error, error instanceof Error ? error.stack : '');
    
    // Return error response instead of masking failures
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to log admin error'
    }, { status: 500 });
  }
}

// Helper function to notify about critical admin errors
async function notifyAdminError(errorData: ErrorLog, user: any) {
  try {
    const admin = await createAdminClient();
    
    // Log critical error notification (simplified for now)
    console.error('CRITICAL ADMIN ERROR NOTIFICATION:', {
      title: 'Critical Admin Panel Error',
      message: `Admin panel error occurred for user ${user.email}: ${errorData.message}`,
      type: 'error',
      severity: 'high',
      data: {
        errorId: errorData.errorId,
        userId: user.id,
        url: errorData.url,
        timestamp: errorData.timestamp
      },
      created_at: new Date().toISOString()
    });

    // TODO: Add email notification or webhook integration here
    // Example: await sendEmailNotification(errorData, user);
    
  } catch (error) {
    console.error('Failed to create admin error notification:', error);
  }
}

// GET endpoint to retrieve admin error logs
export async function GET(request: NextRequest) {
  try {
    // Skip authentication during build time
    if (process.env.NODE_ENV === 'production' && !request.headers.get('user-agent')) {
      return NextResponse.json({ 
        success: true,
        data: [],
        pagination: { limit: 50, offset: 0, count: 0 },
        note: 'Build time execution - no data available'
      });
    }

    // Verify authentication and admin status
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('workos_user_id', user.id)
      .single();

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
    
    const limit = Math.min(Number.isFinite(limitParam) ? limitParam : 50, 100);
    const offset = Math.max(Number.isFinite(offsetParam) ? offsetParam : 0, 0);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    // Return mock data for now since error_logs table may not exist
    const mockErrorLogs = [
      {
        id: '1',
        user_id: user.id,
        error_data: { message: 'Sample admin error log' },
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockErrorLogs,
      pagination: {
        limit,
        offset,
        count: 1
      },
      note: 'Mock data - error_logs table not yet implemented'
    });

  } catch (error) {
    console.error('Error retrieving admin error logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve error logs' }, { status: 500 });
  }
}