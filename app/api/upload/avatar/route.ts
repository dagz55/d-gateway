import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/client';
import { validateImageFile } from '@/lib/validation';

// Type definitions
interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Configure route to handle larger files
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    let user;
    try {
      user = await currentUser();
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const base64Data = formData.get('base64') as string;

    if (!file && !base64Data) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    let avatarUrl: string;
    const supabase = createClient();

    // Try Supabase storage first if file is provided
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id || 'user'}/avatar-${timestamp}-${randomString}.${fileExtension}`;

      try {
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('public_image')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('public_image')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;

        // Delete old avatar if it exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('clerk_user_id', user.id)
          .single();

        if (profile?.avatar_url && profile.avatar_url.includes('supabase')) {
          const oldFileName = profile.avatar_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('public_image')
              .remove([`${user.id || 'user'}/${oldFileName}`]);
          }
        }

        console.log(`Avatar uploaded: ${fileName} for user ${user.id}`);

      } catch (storageError) {
        console.warn('Storage upload failed, falling back to base64:', storageError);
        
        // Fallback to base64 if storage fails
        if (base64Data) {
          avatarUrl = base64Data;
          console.log(`Avatar uploaded via base64 fallback for user ${user.id}`);
        } else {
          throw storageError;
        }
      }
    } else {
      // Use base64 data directly
      avatarUrl = base64Data;
      console.log(`Avatar uploaded via base64 only for user ${user.id}`);
    }

    // Update user profile
    const { error: updateError } = await (supabase
      .from('user_profiles'))
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar updated successfully',
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    console.error('Avatar upload failed:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Get current avatar URL
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('clerk_user_id', user.id)
      .single();

    // Delete from storage if it's a storage URL
    if (profile?.avatar_url && profile.avatar_url.includes('supabase')) {
      const oldFileName = profile.avatar_url.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('public_image')
          .remove([`${user.id || 'user'}/${oldFileName}`]);
      }
    }

    // Remove avatar URL from profile
    const { error: updateError } = await (supabase
      .from('user_profiles'))
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log(`Avatar removed for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });

  } catch (error) {
    console.error('Avatar removal error:', error);
    
    console.error('Avatar removal failed:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove avatar',
      },
      { status: 500 }
    );
  }
}
