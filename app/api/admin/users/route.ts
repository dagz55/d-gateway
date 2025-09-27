import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk-auth'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import { createAdminClient } from '@/lib/supabase/adminClient'

// Debug flag for PII logging
const DEBUG_ADMIN_LOGS = process.env.NODE_ENV !== 'production' || process.env.DEBUG_ADMIN_LOGS === 'true';

async function assertAdmin(request?: NextRequest) {
  // Skip authentication during build time
  if (process.env.NODE_ENV === 'production' && request && !request.headers.get('user-agent')) {
    return { user: null, isAdmin: false, buildTime: true }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      console.log('Admin API: No user found');
      return { user: null, isAdmin: false }
    }

    // Enhanced admin status checking with detailed logging
    const publicMetadata = user.publicMetadata || {};
    const organizationMemberships = (user as any)?.organizationMemberships || [];

    const adminChecks = {
      isAdminFlag: publicMetadata.isAdmin === true,
      adminRole: publicMetadata.role === 'admin',
      superAdminRole: publicMetadata.role === 'super_admin',
      organizationAdmin: organizationMemberships.some((membership: any) =>
        membership.role === 'admin' || membership.role === 'owner'
      )
    };

    const isAdminUser = Object.values(adminChecks).some(Boolean);

    // Log admin check result only in debug mode
    if (DEBUG_ADMIN_LOGS) {
      console.log('Admin API: User check result', {
        userId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        isAdmin: isAdminUser,
        checks: adminChecks,
        publicMetadata,
        organizationMemberships: organizationMemberships.length
      });
    }

    return { user, isAdmin: isAdminUser }
  } catch (error) {
    console.error('Admin API: Error checking admin status:', error);
    return { user: null, isAdmin: false }
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await assertAdmin(request)
    if (adminCheck.buildTime) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { limit: 50, offset: 0, count: 0 },
        note: 'Build time execution - no data available'
      })
    }

    const { user, isAdmin } = adminCheck
    if (!user) {
      console.log('Admin API: No user found, returning 401');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin) {
      if (DEBUG_ADMIN_LOGS) {
        console.log('Admin API: User is not admin', {
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          publicMetadata: user.publicMetadata,
          organizationMemberships: (user as any)?.organizationMemberships?.length || 0
        });
      }

      const responseBody: { success: boolean; message: string; debug?: any } = {
        success: false,
        message: 'Forbidden - Admin access required'
      };

      // Include debug info only in debug mode
      if (DEBUG_ADMIN_LOGS) {
        responseBody.debug = {
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          publicMetadata: user.publicMetadata,
          organizationMemberships: (user as any)?.organizationMemberships?.length || 0,
          timestamp: new Date().toISOString()
        };
      }

      return NextResponse.json(responseBody, { status: 403 })
    }

    // Debug environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      supabaseUrlStart: supabaseUrl?.substring(0, 20) + '...',
      serviceRoleKeyStart: serviceRoleKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables:', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey
      });
      return NextResponse.json({
        success: false,
        message: 'Server configuration error: Missing Supabase credentials'
      }, { status: 500 });
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const q = (searchParams.get('q') || '').toLowerCase()

    try {
      let query = admin
        .from('user_profiles')
        .select('id, email, username, full_name, is_admin, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (q) {
        query = query.or(`email.ilike.%${q}%,username.ilike.%${q}%,full_name.ilike.%${q}%`)
      }

      const start = (page - 1) * limit
      const end = start + limit - 1

      console.log('Attempting Supabase query with params:', { start, end, q, page, limit });

      const { data, error, count } = await query.range(start, end)

      console.log('Supabase query result:', {
        dataLength: data?.length,
        count,
        error: error?.message || 'none'
      });

      if (error) {
        console.error('Supabase query error details:', error);
        throw error;
      }

      // Transform field names to match component expectations
      const transformedData = data?.map(item => ({
        user_id: item.id,
        email: item.email,
        display_name: item.username,
        full_name: item.full_name,
        is_admin: item.is_admin,
        created_at: item.created_at,
        role: item.is_admin ? 'admin' : 'member'
      })) || []

      return NextResponse.json({
        success: true,
        data: {
          items: transformedData,
          total: count || 0,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil((count || 0) / limit))
        }
      })
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, isAdmin } = await assertAdmin()
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const targetId: string | undefined = body?.id
    const newValue: boolean | undefined = body?.is_admin
    if (!targetId || typeof newValue !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }

    // optional safety: prevent removing your own admin accidentally
    if (user.id === targetId && newValue === false) {
      return NextResponse.json({ success: false, message: 'Cannot remove your own admin rights' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('user_profiles')
      .update({ is_admin: newValue })
      .eq('clerk_user_id', targetId)
      .select('id, email, username, full_name, is_admin')
      .single()
    if (error) throw error

    // Transform field names to match component expectations
    const transformedData = {
      user_id: data.id,
      email: data.email,
      display_name: data.username,
      full_name: data.full_name,
      is_admin: data.is_admin,
      role: data.is_admin ? 'admin' : 'member'
    }

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}