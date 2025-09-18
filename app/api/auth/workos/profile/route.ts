import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, logSecurityEvent } from '@/lib/auth-middleware';
import { createWorkOSSupabaseClient } from '@/lib/supabase/workosClient';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get workos_user_id from query params or use current user
    const { searchParams } = new URL(request.url);
    const workosUserId = searchParams.get('workos_user_id') || user.id;

    // Security check: users can only access their own profile unless they're admin
    if (workosUserId !== user.id) {
      // Check if current user is admin
      const supabaseClient = createWorkOSSupabaseClient();
      const { data: currentUserProfile } = await supabaseClient
        .from('user_profiles')
        .select('is_admin')
        .eq('workos_user_id', user.id)
        .single();

      if (!currentUserProfile?.is_admin) {
        logSecurityEvent('unauthorized_profile_access', {
          userId: user.id,
          attemptedAccess: workosUserId,
          reason: 'Non-admin user attempting to access other profile'
        });
        return NextResponse.json(
          { error: 'Forbidden: Cannot access other user profiles' },
          { status: 403 }
        );
      }
    }

    // Fetch user profile from database
    const supabaseClient = createWorkOSSupabaseClient();
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('workos_user_id', workosUserId)
      .single();

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError);
      
      // If profile doesn't exist, create a basic one from WorkOS data
      if (profileError.code === 'PGRST116') { // No rows returned
        // Check if user is admin using only environment variable allowlist
        const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
        const isAdminUser = user.email && allowedAdminEmails.includes(user.email);

        const basicProfile = {
          workos_user_id: user.id,
          email: user.email,
          username: (typeof user.email === 'string' && user.email.includes('@')) 
            ? user.email.split('@')[0] 
            : user.id || user.firstName || 'unknown',
          full_name: `${user.firstName} ${user.lastName}`,
          first_name: user.firstName,
          last_name: user.lastName,
          avatar_url: user.profilePictureUrl,
          profile_picture_url: user.profilePictureUrl,
          is_admin: isAdminUser,
          package: 'PREMIUM',
          trader_level: 'BEGINNER',
          status: 'ONLINE',
          role: isAdminUser ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Try to create the profile
        const { data: newProfile, error: createError } = await supabaseClient
          .from('user_profiles')
          .insert(basicProfile)
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
          );
        }

        logSecurityEvent('profile_auto_created', {
          userId: user.id,
          isAdmin: isAdminUser
        });

        return NextResponse.json(newProfile);
      }

      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile API error:', error);
    logSecurityEvent('profile_api_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      logSecurityEvent('unauthorized_profile_update_attempt', {
        reason: 'User not authenticated'
      });
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Validate and sanitize input data
    const allowedFields = [
      'username', 'full_name', 'first_name', 'last_name', 
      'bio', 'phone', 'country', 'timezone', 'language',
      'package', 'trader_level', 'status'
    ];
    
    const sanitizedUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) {
        logSecurityEvent('invalid_profile_field', {
          userId: user.id,
          field: key,
          reason: 'Field not in allowlist'
        });
        continue; // Skip disallowed fields
      }
      
      // Type and length validation
      if (typeof value === 'string') {
        switch (key) {
          case 'username':
            if (!/^[a-zA-Z0-9_-]{3,30}$/.test(value)) {
              return NextResponse.json(
                { error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.trim().toLowerCase();
            break;
          case 'full_name':
          case 'first_name':
          case 'last_name':
            if (value.length > 100) {
              return NextResponse.json(
                { error: `${key} must be under 100 characters` },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.trim();
            break;
          case 'bio':
            if (value.length > 500) {
              return NextResponse.json(
                { error: 'Bio must be under 500 characters' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.trim();
            break;
          case 'phone':
            if (value.length > 20) {
              return NextResponse.json(
                { error: 'Phone number must be under 20 characters' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.trim();
            break;
          case 'package':
            const allowedPackages = ['FREE', 'PREMIUM', 'PRO', 'ENTERPRISE'];
            if (!allowedPackages.includes(value.toUpperCase())) {
              return NextResponse.json(
                { error: 'Invalid package type' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.toUpperCase();
            break;
          case 'trader_level':
            const allowedLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
            if (!allowedLevels.includes(value.toUpperCase())) {
              return NextResponse.json(
                { error: 'Invalid trader level' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.toUpperCase();
            break;
          case 'status':
            const allowedStatuses = ['ONLINE', 'OFFLINE', 'AWAY', 'BUSY'];
            if (!allowedStatuses.includes(value.toUpperCase())) {
              return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
              );
            }
            sanitizedUpdates[key] = value.toUpperCase();
            break;
          default:
            sanitizedUpdates[key] = value.trim();
        }
      } else {
        sanitizedUpdates[key] = value;
      }
    }
    
    // Security: Remove sensitive fields that shouldn't be updated via this endpoint
    delete sanitizedUpdates.workos_user_id;
    delete sanitizedUpdates.user_id;
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.created_at;
    delete sanitizedUpdates.is_admin; // Admin status should not be changeable via API
    delete sanitizedUpdates.role; // Role should not be changeable via API
    
    // Add updated timestamp
    sanitizedUpdates.updated_at = new Date().toISOString();

    const supabaseClient = createWorkOSSupabaseClient();
    
    // If username is being updated, check for uniqueness
    if (sanitizedUpdates.username) {
      const { data: existingUser } = await supabaseClient
        .from('user_profiles')
        .select('username')
        .eq('username', sanitizedUpdates.username)
        .neq('workos_user_id', user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }
    
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('user_profiles')
      .update(sanitizedUpdates)
      .eq('workos_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    logSecurityEvent('profile_updated', {
      userId: user.id,
      updatedFields: Object.keys(sanitizedUpdates).filter(key => key !== 'updated_at')
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile update API error:', error);
    logSecurityEvent('profile_update_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}