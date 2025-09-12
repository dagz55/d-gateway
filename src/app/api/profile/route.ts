import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const userId = (session as any).user.id;

    // Get user profile from Supabase
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Return user profile data
    return NextResponse.json(
      { success: true, data: profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const userId = (session as any).user.id;
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'updateProfile') {
      const validatedData = updateProfileSchema.parse(data);

      // Check if username is already taken (if username is being updated)
      if (validatedData.username) {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('username', validatedData.username)
          .neq('user_id', userId)
          .single();
        
        if (existingProfile) {
          return NextResponse.json(
            { success: false, message: 'Username already taken' },
            { status: 409 }
          );
        }
      }

      // Update user profile in Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: validatedData.fullName,
          username: validatedData.username,
          avatar_url: validatedData.avatarUrl,
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (updateError || !updatedProfile) {
        return NextResponse.json(
          { success: false, message: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: updatedProfile },
        { status: 200 }
      );
    }

    if (action === 'changePassword') {
      const validatedData = changePasswordSchema.parse(data);

      // Update password using Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: validatedData.newPassword
      });

      if (passwordError) {
        return NextResponse.json(
          { success: false, message: passwordError.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Password changed successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
