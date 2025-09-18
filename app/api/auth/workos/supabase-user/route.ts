import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-middleware';
import { createWorkOSSupabaseClient, getCurrentSupabaseUser } from '@/lib/supabase/workosClient';

export async function GET(request: NextRequest) {
  try {
    // First check if user is authenticated with WorkOS
    const workosUser = await getCurrentUser();

    if (!workosUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Supabase integration is currently disabled
    // Return a placeholder response
    return NextResponse.json({
      message: 'Supabase integration disabled - using WorkOS authentication only',
      user: null
    });
  } catch (error) {
    console.error('Get Supabase user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
