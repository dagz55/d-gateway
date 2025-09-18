"use server"

import { getCurrentUser } from "@/lib/auth-middleware"
import { createWorkOSSupabaseClient } from "@/lib/supabase/workosClient"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { clearCSRFTokens } from "@/lib/csrf-protection"
import { logSecurityEvent } from "@/lib/auth-middleware"

export async function signOut() {
  try {
    const user = await getCurrentUser()
    
    // Clear WorkOS session cookie
    const cookieStore = await cookies()
    cookieStore.delete('wos-session')
    
    // Clear CSRF tokens for security
    await clearCSRFTokens()
    
    // Log security event
    logSecurityEvent('user_logout', {
      userId: user?.id,
      reason: 'User initiated logout'
    });
    
    console.log('✅ WorkOS session and CSRF tokens cleared')
  } catch (error) {
    console.error('SignOut action failed:', error)
    // Still redirect even if there's an error to prevent stuck auth states
  }
  
  redirect("/")
}

export async function uploadAvatarBase64(base64Data: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_avatar_upload', {
        action: 'uploadAvatarBase64',
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    if (!base64Data) {
      throw new Error('No image data provided')
    }

    // Validate base64 data format for security
    if (!base64Data.startsWith('data:image/')) {
      logSecurityEvent('invalid_avatar_upload', {
        userId: user.id,
        reason: 'Invalid base64 data format'
      });
      throw new Error('Invalid image data format')
    }

    const supabase = createWorkOSSupabaseClient()

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: base64Data,
        profile_picture_url: base64Data,
        updated_at: new Date().toISOString()
      })
      .eq('workos_user_id', user.id)

    if (profileError) {
      console.warn('Could not update avatar in user_profiles:', profileError)
      throw profileError
    }

    logSecurityEvent('avatar_updated', {
      userId: user.id,
      method: 'base64'
    });

    revalidatePath('/profile')
    return { success: true, avatarUrl: base64Data }
  } catch (error) {
    console.error('Error uploading avatar (base64):', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    }
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_avatar_upload', {
        action: 'uploadAvatar',
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    const supabase = createWorkOSSupabaseClient()

    const file = formData.get('file') as File
    const base64Data = formData.get('base64') as string

    if (!file && !base64Data) {
      throw new Error('No file or data provided')
    }

    // Validate file type and size for security
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        logSecurityEvent('invalid_file_type', {
          userId: user.id,
          fileType: file.type,
          fileName: file.name
        });
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      }
      
      if (file.size > maxSize) {
        logSecurityEvent('file_too_large', {
          userId: user.id,
          fileSize: file.size,
          fileName: file.name
        });
        throw new Error('File too large. Maximum size is 5MB.');
      }
    }

    let avatarUrl: string
    
    // Get current avatar from profile
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url, profile_picture_url')
      .eq('workos_user_id', user.id)
      .single()
    
    const currentAvatarUrl = currentProfile?.avatar_url || currentProfile?.profile_picture_url

    if (file) {
      // Try Supabase Storage upload
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        // Upload file to Supabase Storage
        // Determine a safe content type. Some environments may not
        // populate file.type, so fall back to common types by extension
        const inferContentType = (name: string, fallback = 'application/octet-stream') => {
          const ext = name.split('.').pop()?.toLowerCase()
          switch (ext) {
            case 'jpg':
            case 'jpeg':
              return 'image/jpeg'
            case 'png':
              return 'image/png'
            case 'gif':
              return 'image/gif'
            case 'webp':
              return 'image/webp'
            default:
              return fallback
          }
        }

        const contentType = file.type || inferContentType(file.name)

        const { error: uploadError } = await supabase.storage
          .from('public_image')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType,
          })

        if (uploadError) {
          // Handle specific MIME type errors more gracefully
          if (uploadError.message.toLowerCase().includes('mime type') && uploadError.message.toLowerCase().includes('not supported')) {
            // Fall back to base64 if provided
            throw new Error('MIME_TYPE_NOT_SUPPORTED')
          }
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('public_image')
          .getPublicUrl(fileName)

        avatarUrl = publicUrl

        // Delete old avatar if it exists in storage
        if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
          const oldFileName = currentAvatarUrl.split('/').pop()
          if (oldFileName) {
            await supabase.storage
              .from('public_image')
              .remove([oldFileName])
          }
        }

        logSecurityEvent('avatar_uploaded', {
          userId: user.id,
          method: 'storage',
          fileName: fileName
        });

      } catch (storageError) {
        // Don't log MIME type errors as they're expected and handled gracefully
        if (storageError instanceof Error && storageError.message === 'MIME_TYPE_NOT_SUPPORTED') {
          // Silently fall back to base64 for unsupported MIME types
        } else {
          console.warn('Storage upload failed, falling back to base64:', storageError)
        }
        
        // If storage fails and no base64 provided, return error
        if (!base64Data) {
          throw new Error('Storage upload failed and no fallback data provided')
        }
        avatarUrl = base64Data
      }
    } else if (base64Data) {
      // Validate base64 data format for security
      if (!base64Data.startsWith('data:image/')) {
        logSecurityEvent('invalid_avatar_upload', {
          userId: user.id,
          reason: 'Invalid base64 data format'
        });
        throw new Error('Invalid image data format')
      }
      
      // Use base64 data directly
      avatarUrl = base64Data
    } else {
      throw new Error('No valid data to upload')
    }

    // Update user_profiles table (WorkOS doesn't use auth metadata)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        profile_picture_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('workos_user_id', user.id)

    if (profileError) {
      console.warn('Could not update avatar in user_profiles:', profileError)
      // Don't fail the entire operation if profile update fails
    }

    revalidatePath('/profile')
    return { success: true, avatarUrl }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload avatar' 
    }
  }
}

export async function removeAvatar() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_avatar_removal', {
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    const supabase = createWorkOSSupabaseClient()
    
    // Get current avatar URL from profile
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url, profile_picture_url')
      .eq('workos_user_id', user.id)
      .single()
    
    const currentAvatarUrl = currentProfile?.avatar_url || currentProfile?.profile_picture_url

    // Update user_profiles table (WorkOS doesn't use auth metadata)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: null,
        profile_picture_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('workos_user_id', user.id)

    if (profileError) {
      console.warn('Could not update avatar in user_profiles:', profileError)
      // Don't fail the entire operation if profile update fails
    }

    // Delete the file from storage if it exists (not base64)
    if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
      try {
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('public_image')
            .remove([oldFileName])
        }
      } catch (storageError) {
        console.warn('Could not delete old avatar from storage:', storageError)
        // Don't fail the entire operation if storage deletion fails
      }
    }

    logSecurityEvent('avatar_removed', {
      userId: user.id
    });

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error removing avatar:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove avatar' 
    }
  }
}

// Profile update actions
export async function updateProfile(data: {
  full_name?: string;
  username?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
}) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_profile_update', {
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    // Validate and sanitize input data
    const sanitizedData: typeof data = {};
    
    if (data.full_name !== undefined) {
      if (typeof data.full_name !== 'string' || data.full_name.length > 100) {
        throw new Error('Invalid full name');
      }
      sanitizedData.full_name = data.full_name.trim();
    }
    
    if (data.username !== undefined) {
      if (typeof data.username !== 'string' || !/^[a-zA-Z0-9_-]{3,30}$/.test(data.username)) {
        throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens');
      }
      sanitizedData.username = data.username.trim().toLowerCase();
    }
    
    if (data.bio !== undefined) {
      if (typeof data.bio !== 'string' || data.bio.length > 500) {
        throw new Error('Bio must be under 500 characters');
      }
      sanitizedData.bio = data.bio.trim();
    }
    
    if (data.phone !== undefined) {
      if (typeof data.phone !== 'string' || data.phone.length > 20) {
        throw new Error('Invalid phone number');
      }
      sanitizedData.phone = data.phone.trim();
    }

    const supabase = createWorkOSSupabaseClient()

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        ...sanitizedData,
        updated_at: new Date().toISOString()
      })
      .eq('workos_user_id', user.id)

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`)
    }

    logSecurityEvent('profile_updated', {
      userId: user.id,
      updatedFields: Object.keys(sanitizedData)
    });

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }
  }
}

export async function updateUsername(newUsername: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_username_update', {
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    // Validate username format
    if (typeof newUsername !== 'string' || !/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
      throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens');
    }

    const sanitizedUsername = newUsername.trim().toLowerCase();

    const supabase = createWorkOSSupabaseClient()

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', sanitizedUsername)
      .neq('workos_user_id', user.id)
      .single()

    if (existingUser) {
      throw new Error('Username is already taken')
    }

    // Update username in user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        username: sanitizedUsername,
        updated_at: new Date().toISOString()
      })
      .eq('workos_user_id', user.id)

    if (profileError) {
      throw new Error(`Username update failed: ${profileError.message}`)
    }

    logSecurityEvent('username_updated', {
      userId: user.id,
      newUsername: sanitizedUsername
    });

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating username:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update username'
    }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      logSecurityEvent('unauthorized_password_update', {
        reason: 'User not authenticated'
      });
      throw new Error('User not authenticated')
    }

    // WorkOS handles password management through their API
    // This would require WorkOS User Management API calls
    // For now, return an error indicating this should be handled through WorkOS
    
    logSecurityEvent('password_change_attempted', {
      userId: user.id,
      reason: 'Redirected to WorkOS'
    });
    
    return {
      success: false,
      error: 'Password changes must be handled through WorkOS authentication. Please contact support.'
    }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password'
    }
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const supabase = createWorkOSSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logSecurityEvent('login_failed', {
        email: email.substring(0, 3) + '***', // Partial email for security
        reason: error.message
      });
      return { success: false, error: error.message };
    }

    logSecurityEvent('login_success', {
      email: email.substring(0, 3) + '***'
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getUserProfile() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = createWorkOSSupabaseClient()

    // Get user profile from user_profiles table
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('workos_user_id', user.id)

    if (error) {
      console.error('Database query error:', error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    // Handle different scenarios
    if (!profiles || profiles.length === 0) {
      // Check if user is admin using environment variable and email patterns
      const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
      const isAdminUser = user.email && (
        allowedAdminEmails.includes(user.email) ||
        user.email.includes('admin') ||
        user.email === 'admin@zignals.org' ||
        user.email === 'dagz55@gmail.com' ||
        user.email === 'support@zignals.org'
      );

      // No profile found - create a basic one
      const basicProfile = {
        workos_user_id: user.id,
        email: user.email,
        username: user.email.split('@')[0],
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
      }

      // Try to create the profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(basicProfile)
        .select()
        .single()

      if (createError) {
        console.error('Failed to create profile:', createError)
        return {
          success: false,
          error: 'Failed to create user profile'
        }
      }

      logSecurityEvent('profile_created', {
        userId: user.id,
        isAdmin: isAdminUser
      });

      return { success: true, profile: newProfile }
    }

    if (profiles.length > 1) {
      // Multiple profiles found - use the first one and log warning
      console.warn(`Multiple profiles found for user ${user.id}, using first one`)
      return { success: true, profile: profiles[0] }
    }

    // Single profile found - return it
    return { success: true, profile: profiles[0] }

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile'
    }
  }
}