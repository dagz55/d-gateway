import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { currentUser, auth } from '@clerk/nextjs/server';
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
 * Check if the current user is an admin using session claims (matching middleware logic)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // Use auth() to get session claims (same as middleware)
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    if (!user) return false;

    // Check multiple possible locations for admin role (matching middleware logic exactly)
    const isClerkAdmin = user.publicMetadata?.role === 'admin';

    if (isClerkAdmin) return true;

    // Fallback to Supabase profile check (if database is available)
    try {
      const supabase = await createServerSupabaseClient();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin, role')
        .eq('clerk_user_id', userId)
        .single();

      return profile?.is_admin === true || profile?.role === 'admin';
    } catch (supabaseError) {
      // If Supabase check fails, rely on Clerk metadata only
      console.log('Supabase admin check failed, using Clerk session claims only');
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Cache for admin user to reduce repeated checks
let adminUserCache: { user: AdminUser | null; timestamp: number } | null = null;
const ADMIN_CACHE_TTL = 30 * 1000; // 30 seconds cache

/**
 * Get current admin user with permissions (with caching to reduce excessive checks)
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    // Check cache first
    const now = Date.now();
    if (adminUserCache && (now - adminUserCache.timestamp < ADMIN_CACHE_TTL)) {
      return adminUserCache.user;
    }

    // Use auth() to get session claims (same as middleware) and get user data
    const { userId, sessionClaims } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      adminUserCache = { user: null, timestamp: now };
      return null;
    }
    
    // Only log on first check or when debugging
    if (process.env.NODE_ENV === 'development' && !adminUserCache) {
      console.log(`getAdminUser: Checking admin status for Clerk user ${user.emailAddresses[0]?.emailAddress} (ID: ${userId})`);
    }
    
    // Check multiple possible locations for admin role (matching middleware logic exactly)
    const isClerkAdmin = user.publicMetadata?.role === 'admin';
      
    const clerkPermissions = (sessionClaims as any)?.publicMetadata?.admin_permissions as string[] || 
                            user.publicMetadata?.admin_permissions as string[] || [];
    
    // Only log detailed info in development and on first check
    if (process.env.NODE_ENV === 'development' && !adminUserCache) {
      console.log('getAdminUser: Clerk admin check details:', {
        publicMetadataRole: (sessionClaims as any)?.publicMetadata?.role,
        metadataRole: (sessionClaims as any)?.metadata?.role,
        directRole: (sessionClaims as any)?.role,
        organizationRole: (sessionClaims as any)?.o?.rol,
        userPublicMetadataRole: user.publicMetadata?.role,
        sessionClaimsKeys: Object.keys(sessionClaims || {}),
        isClerkAdmin
      });
    }
    
    if (isClerkAdmin) {
      const adminUser = {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
        display_name: user.firstName || 'Admin',
        role: 'admin' as const,
        is_admin: true,
        admin_permissions: clerkPermissions.length > 0 ? clerkPermissions : ['users', 'signals', 'finances', 'payments', 'system']
      };
      
      adminUserCache = { user: adminUser, timestamp: now };
      
      if (process.env.NODE_ENV === 'development' && !adminUserCache) {
        console.log(`getAdminUser: Admin user found via Clerk session claims: ${user.emailAddresses[0]?.emailAddress}`);
      }
      
      return adminUser;
    }
    
    // Fallback to Supabase profile check
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();
      
    if (!profile || !profile.is_admin) {
      adminUserCache = { user: null, timestamp: now };
      return null;
    }
    
    const adminUser = {
      id: profile.clerk_user_id || userId,
      email: profile.email,
      full_name: profile.full_name,
      display_name: profile.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      role: profile.role,
      is_admin: profile.is_admin,
      admin_permissions: profile.admin_permissions || []
    };
    
    adminUserCache = { user: adminUser, timestamp: now };
    
    if (process.env.NODE_ENV === 'development' && !adminUserCache) {
      console.log(`getAdminUser: Admin user found via Supabase: ${profile.email}`);
    }
    
    return adminUser;
  } catch (error) {
    console.error('Error getting admin user:', error);
    adminUserCache = { user: null, timestamp: Date.now() };
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
    redirect('/dashboard/members');
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
    redirect('/dashboard/admins');
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
    // Check Clerk authentication first
    const user = await currentUser();
    if (!user) {
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
