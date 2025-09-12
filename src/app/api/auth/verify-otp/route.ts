import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = verifyOTPSchema.parse(body);

    // Create Supabase client
    const supabase = await createClient();

    try {
      // Verify OTP and update password using Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (error) {
        console.error('Supabase OTP verification error:', error);
        return NextResponse.json(
          { success: false, message: 'Invalid or expired reset code' },
          { status: 400 }
        );
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Supabase password update error:', updateError);
        return NextResponse.json(
          { success: false, message: 'Failed to update password' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Password reset successful!'
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Supabase verification error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to verify reset code' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Password reset verification error:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { success: false, message: errorMessage, errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
