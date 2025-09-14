"use server"

import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function uploadAvatarBase64(base64Data: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (!base64Data) {
      throw new Error('No image data provided')
    }

    // Update user metadata with the base64 data
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: base64Data
      }
    })

    if (updateError) {
      throw updateError
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
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const file = formData.get('file') as File
    const base64Data = formData.get('base64') as string

    if (!file && !base64Data) {
      throw new Error('No file or data provided')
    }

    let avatarUrl: string
    const currentAvatarUrl = user.user_metadata?.avatar_url

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
          .from('avatars')
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
          .from('avatars')
          .getPublicUrl(fileName)

        avatarUrl = publicUrl

        // Delete old avatar if it exists in storage
        if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
          const oldFileName = currentAvatarUrl.split('/').pop()
          if (oldFileName) {
            await supabase.storage
              .from('avatars')
              .remove([oldFileName])
          }
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
      // Use base64 data directly
      avatarUrl = base64Data
    } else {
      throw new Error('No valid data to upload')
    }

    // Update user metadata with the new avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    })

    if (updateError) {
      throw updateError
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
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const currentAvatarUrl = user.user_metadata?.avatar_url

    // Remove avatar URL from user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: null
      }
    })

    if (updateError) {
      throw updateError
    }

    // Delete the file from storage if it exists (not base64)
    if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
      try {
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName])
        }
      } catch (storageError) {
        console.warn('Could not delete old avatar from storage:', storageError)
        // Don't fail the entire operation if storage deletion fails
      }
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
