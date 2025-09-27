import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get user count
    const { count, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        error: 'Failed to get user count',
        details: countError
      }, { status: 500 });
    }

    // Get detailed user info
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('clerk_user_id, email, full_name, is_admin, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({
        error: 'Failed to get user details',
        details: usersError
      }, { status: 500 });
    }

    const adminCount = users?.filter(u => u.is_admin).length || 0;
    const memberCount = (users?.length || 0) - adminCount;

    return NextResponse.json({
      success: true,
      userCount: count,
      adminCount,
      memberCount,
      users: users?.map(user => ({
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isAdmin: user.is_admin,
        clerkId: user.clerk_user_id
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}