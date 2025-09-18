import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-middleware';
import { getAdminUser } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication during build time
    if (process.env.NODE_ENV === 'production' && !request.headers.get('user-agent')) {
      return NextResponse.json({
        success: true,
        status: 'healthy',
        checks: {
          auth: 'build-time',
          database: 'build-time',
          admin_access: 'build-time'
        },
        note: 'Build time execution'
      });
    }

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          status: 'unhealthy',
          checks: {
            auth: 'failed'
          }
        }, 
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('workos_user_id', user.id)
      .single();

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required',
          status: 'unauthorized',
          checks: {
            auth: 'success',
            admin: 'failed'
          }
        }, 
        { status: 403 }
      );
    }

    // Perform health checks
    const healthChecks = {
      auth: 'success',
      admin: 'success',
      database: 'unknown',
      api: 'success',
      timestamp: new Date().toISOString()
    };

    // Test database connectivity
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database health check failed:', error);
        healthChecks.database = 'failed';
      } else {
        healthChecks.database = 'success';
      }
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      healthChecks.database = 'failed';
    }

    // Determine overall health status
    const hasFailures = Object.values(healthChecks).some(status => status === 'failed');
    const overallStatus = hasFailures ? 'degraded' : 'healthy';

    return NextResponse.json({
      success: true,
      status: overallStatus,
      checks: healthChecks,
      message: overallStatus === 'healthy' 
        ? 'Admin panel is functioning normally' 
        : 'Admin panel has some issues but is operational'
    });

  } catch (error) {
    console.error('Admin health check error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      checks: {
        auth: 'unknown',
        admin: 'unknown',
        database: 'unknown',
        api: 'failed'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Lightweight HEAD handler for health checks
export async function HEAD(request: NextRequest) {
  try {
    // Verify admin access - getAdminUser includes authentication check
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return new Response(null, { status: 401 });
    }

    // Lightweight database check
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    // Return status based on database health
    if (error) {
      return new Response(null, { status: 503 }); // Service Unavailable
    } else {
      return new Response(null, { status: 200 }); // Healthy
    }
  } catch (error) {
    console.error('HEAD /admin/health failed:', error);
    return new Response(null, { status: 503 }); // Service Unavailable
  }
}