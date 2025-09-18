import { NextRequest, NextResponse } from 'next/server';
import { handleAuthCallback, workosAuthService } from '@/lib/workos-auth-service';
import { workos, workosConfig, validateWorkOSConfig } from '@/lib/workos';
import { createWorkOSSupabaseClient, setWorkOSAccessToken } from '@/lib/supabase/workosClient';
import { randomInt } from 'crypto';
import { 
  createSecureSessionData, 
  setSecureSessionCookie, 
  logSecurityEvent,
  validateSessionEnvironment 
} from '@/lib/session-security';
import { getClientIP } from '@/lib/auth-middleware';
import { withAuthRateLimiting } from '@/middleware/rate-limiting';
import { tokenManager, TOKEN_CONFIG } from '@/lib/token-manager';
import { refreshTokenStore } from '@/lib/refresh-token-store';
import { sessionManager } from '@/lib/session-manager';
import { deviceManager } from '@/lib/device-manager';

export async function GET(request: NextRequest) {
  // Apply authentication-specific rate limiting
  const rateLimitResponse = await withAuthRateLimiting(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }

  try {
    // Validate WorkOS configuration
    validateWorkOSConfig();

    // Validate session environment and log warnings
    const envValidation = validateSessionEnvironment();
    if (envValidation.warnings.length > 0) {
      console.warn('Session environment warnings:', envValidation.warnings);
    }
    if (!envValidation.valid) {
      console.error('Session environment errors:', envValidation.errors);
    }

    // The authorization code returned by AuthKit
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      console.error('No authorization code provided');
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Exchange the authorization code for an authenticated User object
    const authenticateResponse = await workos.userManagement.authenticateWithCode({
      code,
      clientId: workosConfig.clientId,
    });

    const { user, accessToken } = authenticateResponse;

    // Generate session ID for token tracking
    const sessionId = tokenManager.generateSessionId();

    // Create secure session data with enhanced security features
    const sessionData = createSecureSessionData({
      userId: user.id,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      profilePictureUrl: user.profilePictureUrl || undefined,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    }, request);
    
    // Set secure session cookie with enhanced configuration
    await setSecureSessionCookie(sessionData);

    // Create JWT token pair for enhanced security
    const tokenPair = tokenManager.createTokenPair({
      userId: user.id,
      sessionId: sessionId,
      permissions: ['user'], // Default permissions, can be enhanced based on user profile
    });

    // Store refresh token securely in database
    const refreshTokenHash = tokenManager.hashToken(tokenPair.refreshToken);
    const familyId = tokenManager.generateFamilyId();
    
    try {
      // Create token family
      await refreshTokenStore.createTokenFamily({
        familyId,
        userId: user.id,
        sessionId,
        refreshTokenJti: familyId, // Use family ID as initial JTI
        expiresAt: new Date(Date.now() + (TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY * 1000)),
      });

      // Store refresh token
      await refreshTokenStore.storeRefreshToken({
        tokenHash: refreshTokenHash,
        familyId,
        userId: user.id,
        sessionId,
        accessTokenId: tokenPair.accessToken.split('.')[1] || 'unknown', // Get payload part as ID
        expiresAt: new Date(Date.now() + (TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY * 1000)),
      });

      console.log('✅ Token family and refresh token stored successfully');
    } catch (tokenError) {
      console.warn('Failed to store refresh token:', tokenError);
      // Continue anyway - session auth still works
    }

    // Create or update user profile in database (using user_profiles table)
    try {
      const supabaseClient = createWorkOSSupabaseClient();
      
      // Check if user profile already exists
      const { data: existingProfile } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      let authUserId = user.id; // Default to WorkOS user ID

      // If no existing profile, we need to create a user in auth.users first
      if (!existingProfile) {
        try {
          // Create a user in Supabase auth.users table
          const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
            email: user.email || '',
            // WorkOS handles authentication/SSO, so we set a placeholder random password
            // that satisfies the user model/DB constraint but is never used for login
            password: generateSecurePassword(),
            email_confirm: true,
            phone_confirm: true, // Skip phone verification
            user_metadata: {
              workos_user_id: user.id,
              session_id: sessionId,
              first_name: user.firstName,
              last_name: user.lastName,
              full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              profile_picture_url: user.profilePictureUrl,
              provider: 'workos'
            }
          });

          if (authError) {
            console.warn('Failed to create auth user (this is expected with WorkOS):', authError);
            // Use WorkOS user ID directly - this is the preferred approach for WorkOS integration
            authUserId = user.id;
            console.log('✅ Using WorkOS user ID directly (recommended approach)');
          } else {
            authUserId = authUser.user.id;
            console.log('✅ Auth user created for WorkOS user');
          }
        } catch (authError) {
          console.warn('Error creating auth user (using WorkOS ID instead):', authError);
          // Use WorkOS user ID directly
          authUserId = user.id;
          console.log('✅ Fallback to WorkOS user ID');
        }
      } else {
        // Use existing auth user ID
        authUserId = existingProfile.user_id;
      }

      // Check if user is admin using only environment variable allowlist
      const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
      const isAdminUser = user.email && allowedAdminEmails.includes(user.email);

      // Set permissions based on admin status
      const userPermissions = isAdminUser ? ['user', 'admin'] : ['user'];

      const profileData = {
        user_id: authUserId,
        workos_user_id: user.id,
        email: user.email || '',
        username: await generateUniqueUsername(user, supabaseClient),
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        first_name: user.firstName || '',
        last_name: user.lastName || '',
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

      if (existingProfile) {
        // Update existing profile with all WorkOS data including admin status
        const { error: updateError } = await supabaseClient
          .from('user_profiles')
          .update({
            workos_user_id: profileData.workos_user_id,
            email: profileData.email,
            username: profileData.username,
            full_name: profileData.full_name,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            avatar_url: profileData.avatar_url,
            profile_picture_url: profileData.profile_picture_url,
            is_admin: profileData.is_admin,
            role: profileData.role,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (updateError) {
          console.warn('Failed to update user profile:', updateError);
        } else {
          console.log('✅ User profile updated successfully in user_profiles table');
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabaseClient
          .from('user_profiles')
          .insert(profileData);
        
        if (insertError) {
          console.warn('Failed to create user profile:', insertError);
        } else {
          console.log('✅ User profile created successfully in user_profiles table');
        }
      }

      // Update token permissions if user is admin
      if (isAdminUser && userPermissions.includes('admin')) {
        try {
          // Create new token pair with admin permissions
          const adminTokenPair = tokenManager.createTokenPair({
            userId: user.id,
            sessionId,
            permissions: userPermissions,
          });

          // Update stored tokens with admin permissions
          // Note: In a production system, you might want to store permissions separately
          console.log('✅ Admin permissions applied to token pair');
        } catch (permError) {
          console.warn('Failed to apply admin permissions to tokens:', permError);
        }
      }

      // Create session with version-based management
      try {
        const session = await sessionManager.createSession(
          authUserId,
          request,
          userPermissions
        );
        console.log('✅ Session created with version-based management');
      } catch (sessionError) {
        console.warn('Failed to create session with session manager:', sessionError);
        // Continue anyway - legacy session still works
      }

      // Register device for tracking
      try {
        const device = await deviceManager.registerDevice(authUserId, request);
        console.log('✅ Device registered for session tracking');
      } catch (deviceError) {
        console.warn('Failed to register device:', deviceError);
        // Continue anyway - session still works
      }

    } catch (dbError) {
      console.warn('Database error during user profile creation:', dbError);
      // Continue anyway - WorkOS auth still works
    }

    // Log security event
    logSecurityEvent('session_created', {
      userId: user.id,
      sessionId,
      email: user.email,
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request),
      tokenFamily: familyId,
    });

    // If we have an access token, set it up for Supabase
    if (accessToken) {
      try {
        const supabaseClient = createWorkOSSupabaseClient();
        await setWorkOSAccessToken(supabaseClient, accessToken);
        console.log('WorkOS access token set for Supabase');
      } catch (supabaseError) {
        console.warn('Failed to set WorkOS access token for Supabase:', supabaseError);
        // Continue anyway - WorkOS auth still works
      }
    }

    console.log(`User ${user.firstName || ''} ${user.lastName || ''} authenticated successfully`);

    // Create response with token cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Set secure HTTP-only cookies for tokens
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set access token cookie (shorter expiry)
    response.cookies.set('access_token', tokenPair.accessToken, {
      ...cookieOptions,
      maxAge: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
    });

    // Set refresh token cookie (longer expiry)
    response.cookies.set('refresh_token', tokenPair.refreshToken, {
      ...cookieOptions,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    console.error('WorkOS callback error:', error);
    
    // Log security event for failed authentication
    logSecurityEvent('session_creation_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      ipAddress: getClientIP(request)
    });
    
    // If there's an error, redirect to the login page with an error message
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'authentication_failed');
    return NextResponse.redirect(url);
  }
}

// Helper function to generate cryptographically secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Use crypto.randomInt for unbiased sampling
  for (let i = 0; i < 24; i++) {
    password += chars[randomInt(chars.length)];
  }
  
  return password;
}

// Helper function to check if error is a uniqueness constraint violation
function isUniqueConstraintError(error: any): boolean {
  if (!error || typeof error !== 'object') return false;
  
  // Check for PostgreSQL unique constraint violation (SQLSTATE '23505')
  if (error.code === '23505') return true;
  
  // Check for Supabase/PostgREST specific codes
  if (error.code === 'PGRST116') return true;
  
  // Check error message for uniqueness constraint patterns
  const message = error.message || error.details || '';
  const uniquePatterns = [
    'unique constraint',
    'duplicate key',
    'already exists',
    'violates unique constraint'
  ];
  
  return uniquePatterns.some(pattern => 
    message.toLowerCase().includes(pattern)
  );
}

// Helper function to generate unique username with collision handling
async function generateUniqueUsername(user: any, supabaseClient: any): Promise<string> {
  // Validate supabaseClient parameter
  if (!supabaseClient || typeof supabaseClient.from !== 'function') {
    console.warn('Invalid supabaseClient provided to generateUniqueUsername');
    // Return fallback username
    if (user.firstName && user.lastName) {
      return `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`.substring(0, 12);
    }
    return user.id || 'user';
  }

  // Safely extract and validate email local part
  let baseUsername = '';
  
  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    const localPart = user.email.split('@')[0]?.trim();
    if (localPart && localPart.length > 0) {
      baseUsername = localPart
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric chars
        .substring(0, 10); // Limit length
    }
  }
  
  // Fallback to other user fields if email extraction failed
  if (!baseUsername) {
    if (user.firstName && user.lastName) {
      baseUsername = `${user.firstName}${user.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 10);
    } else if (user.firstName) {
      baseUsername = user.firstName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    } else {
      baseUsername = 'user';
    }
  }
  
  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = `${baseUsername}${user.id || 'user'}`.substring(0, 8);
  }

  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 20; // Increased max attempts

  while (attempts < maxAttempts) {
    try {
      // Check if username exists
      const { data: existing } = await supabaseClient
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (!existing) {
        // Username is available
        return username;
      }

      // Username exists, try with numeric suffix
      attempts++;
      const suffix = attempts.toString().padStart(2, '0');
      username = `${baseUsername}${suffix}`;

    } catch (error) {
      // Only retry if it's a uniqueness constraint error
      if (isUniqueConstraintError(error)) {
        attempts++;
        const suffix = attempts.toString().padStart(2, '0');
        username = `${baseUsername}${suffix}`;
      } else {
        // For other errors, rethrow to avoid silent failures
        console.error('Non-uniqueness error in generateUniqueUsername:', error);
        throw error;
      }
    }
  }

  // If all attempts failed, use timestamp + random component
  const timestamp = Date.now().toString().slice(-4);
  const randomComponent = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${baseUsername}${timestamp}${randomComponent}`.substring(0, 16);
}
