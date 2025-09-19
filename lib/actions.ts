"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Note: Clerk handles sign out through UserButton or useClerk().signOut()
// This function is kept for compatibility but Clerk should be used instead
export async function signOut() {
  redirect("/")
}

export async function uploadAvatarBase64(base64Data: string) {
  try {
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    if (!base64Data) {
      throw new Error('No image data provided')
    }

    // Validate base64 data format for security
    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid image data format')
    }

    const supabase = await createServerSupabaseClient()

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: base64Data,
        profile_picture_url: base64Data,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', user.id)

    if (profileError) {
      console.warn('Could not update avatar in user_profiles:', profileError)
      throw profileError
    }

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
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = await createServerSupabaseClient()

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
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      }

      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.');
      }
    }

    let avatarUrl: string
    
    // Get current avatar from profile
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url, profile_picture_url')
      .eq('clerk_user_id', user.id)
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

        if (process.env.NODE_ENV === 'development') {
          console.log(`Avatar uploaded: ${fileName} for user ${user.id}`)
        }

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
        throw new Error('Invalid image data format')
      }
      
      // Use base64 data directly
      avatarUrl = base64Data
    } else {
      throw new Error('No valid data to upload')
    }

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        profile_picture_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', user.id)

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
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = await createServerSupabaseClient()
    
    // Get current avatar URL from profile
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url, profile_picture_url')
      .eq('clerk_user_id', user.id)
      .single()
    
    const currentAvatarUrl = currentProfile?.avatar_url || currentProfile?.profile_picture_url

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: null,
        profile_picture_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', user.id)

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

    if (process.env.NODE_ENV === 'development') {
      console.log(`Avatar removed for user ${user.id}`)
    }

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
    const user = await currentUser()

    if (!user) {
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

    const supabase = await createServerSupabaseClient()

    // Update user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        ...sanitizedData,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', user.id)

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Profile updated for user ${user.id}:`, Object.keys(sanitizedData))
    }

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
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate username format
    if (typeof newUsername !== 'string' || !/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
      throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens');
    }

    const sanitizedUsername = newUsername.trim().toLowerCase();

    const supabase = await createServerSupabaseClient()

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', sanitizedUsername)
      .neq('clerk_user_id', user.id)
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
      .eq('clerk_user_id', user.id)

    if (profileError) {
      throw new Error(`Username update failed: ${profileError.message}`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Username updated for user ${user.id}: ${sanitizedUsername}`)
    }

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
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Clerk handles password management through their dashboard
    // Password changes should be handled through Clerk's user profile
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password change attempted for user ${user.id}`);
    }

    return {
      success: false,
      error: 'Password changes must be handled through your account settings. Please use the profile menu to manage your password.'
    }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password'
    }
  }
}

// Note: Clerk handles authentication through SignIn component
// This function is kept for compatibility but Clerk should be used instead
export async function signInWithPassword(email: string, password: string) {
  // Redirect to Clerk sign-in
  redirect('/sign-in')
}

export async function getUserProfile() {
  try {
    const user = await currentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Return a profile based on Clerk user data directly
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
    const isAdminUser = user.publicMetadata?.role === 'admin';

    const profile = {
      id: user.id,
      clerk_user_id: user.id,
      email: primaryEmail,
      username: user.username || primaryEmail?.split('@')[0] || user.firstName?.toLowerCase() || 'user',
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      first_name: user.firstName,
      last_name: user.lastName,
      bio: user.publicMetadata?.bio as string || '',
      phone: user.phoneNumbers[0]?.phoneNumber || '',
      country: user.publicMetadata?.country as string || '',
      timezone: user.publicMetadata?.timezone as string || 'UTC',
      language: user.publicMetadata?.language as string || 'en',
      package: user.publicMetadata?.package as string || 'Basic',
      trader_level: user.publicMetadata?.trader_level as string || 'Beginner',
      avatar_url: user.imageUrl,
      profile_picture_url: user.imageUrl,
      is_admin: isAdminUser,
      role: isAdminUser ? 'admin' : 'member',
      status: 'ONLINE',
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };

    return { success: true, profile };

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile'
    }
  }
}