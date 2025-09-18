import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getCurrentUser } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  display_name: string;
  role: 'admin' | 'moderator';
  is_admin: boolean;
  admin_permissions: string[];
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // Get WorkOS authenticated user
    const workosUser = await getCurrentUser();
    if (!workosUser) return false;
    
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('workos_user_id', workosUser.id)
      .single();
      
    return profile?.is_admin === true || profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get current admin user with permissions
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    // Get WorkOS authenticated user
    const workosUser = await getCurrentUser();
    if (!workosUser) {
      console.log('getAdminUser: No WorkOS user found');
      return null;
    }
    
    console.log(`getAdminUser: Checking admin status for WorkOS user ${workosUser.email} (ID: ${workosUser.id})`);
    
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('workos_user_id', workosUser.id)
      .single();
      
    console.log(`getAdminUser: Profile query result:`, { profile, error });
    
    if (!profile) {
      console.log('getAdminUser: No profile found');
      return null;
    }
    
    if (!profile.is_admin) {
      console.log(`getAdminUser: User ${profile.email} is not marked as admin (is_admin: ${profile.is_admin})`);
      return null;
    }
    
    console.log(`getAdminUser: Admin user found: ${profile.email}`);
    
    return {
      id: profile.workos_user_id || workosUser.id,
      email: profile.email,
      full_name: profile.full_name,
      display_name: profile.full_name || `${workosUser.firstName || ''} ${workosUser.lastName || ''}`.trim() || 'Unknown User',
      role: profile.role,
      is_admin: profile.is_admin,
      admin_permissions: profile.admin_permissions || []
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Check if admin has specific permission
 */
export async function hasAdminPermission(permission: string): Promise<boolean> {
  const adminUser = await getAdminUser();
  if (!adminUser) return false;
  
  return adminUser.admin_permissions.includes(permission) || 
         adminUser.admin_permissions.includes('system'); // system = all permissions
}

/**
 * Require admin authentication - redirect if not admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    redirect('/');
  }
  
  return adminUser;
}

/**
 * Require specific admin permission - redirect if missing
 */
export async function requireAdminPermission(permission: string): Promise<AdminUser> {
  const adminUser = await requireAdmin();
  
  if (!adminUser.admin_permissions.includes(permission) && 
      !adminUser.admin_permissions.includes('system')) {
    redirect('/admin');
  }
  
  return adminUser;
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any
): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    
    await supabase.rpc('log_admin_activity', {
      action_text: action,
      target_type_text: targetType,
      target_id_text: targetId,
      details_json: details
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

/**
 * Middleware function to protect admin routes
 */
export async function adminMiddleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (!isAdminRoute) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes - handle auth there
  if (request.nextUrl.pathname.startsWith('/admin/api')) {
    return NextResponse.next();
  }
  
  try {
    // Check WorkOS authentication first
    const workosUser = await getCurrentUser();
    if (!workosUser) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
    
    // Then check admin status
    const adminUser = await getAdminUser();
    if (!adminUser) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
}

/**
 * Admin permission types
 */
export const ADMIN_PERMISSIONS = {
  USERS: 'users',
  SIGNALS: 'signals', 
  FINANCES: 'finances',
  PAYMENTS: 'payments',
  SYSTEM: 'system'
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];