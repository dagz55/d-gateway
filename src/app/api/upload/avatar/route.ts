import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session as any).user.id;
    const userName = (session as any).user.name || 'user';
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Generate unique filename with user's name as folder
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${timestamp}-${random}.${extension}`;
    const folderPath = `public_image/${userName}`;
    const filePath = `${folderPath}/${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public_image')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('public_image')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user's avatar URL in Supabase profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', userId);
    
    if (updateError) {
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('public_image')
        .remove([filePath])
        .catch(console.error);
      
      return NextResponse.json(
        { success: false, message: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          avatarUrl,
          filename,
          filePath,
          message: 'Avatar uploaded successfully'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session as any).user.id;
    const userName = (session as any).user.name || 'user';
    
    // Create Supabase client
    const supabase = await createClient();

    // Get current user profile to find existing avatar
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();
      
    if (currentProfile?.avatar_url) {
      // Extract file path from Supabase URL
      const url = new URL(currentProfile.avatar_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'public_image');
      
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Delete file from Supabase storage
        const { error: deleteError } = await supabase.storage
          .from('public_image')
          .remove([filePath]);
        
        if (deleteError) {
          console.error('Error deleting file from storage:', deleteError);
          // Continue with database update even if file deletion fails
        }
      }
    }
    
    // Update user's avatar URL to null in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', userId);
    
    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Avatar removed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
