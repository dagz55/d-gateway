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

    // Try to create Supabase client
    let supabase;
    let supabaseConfigured = false;
    
    try {
      supabase = await createClient();
      // Check if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-') &&
          process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
        supabaseConfigured = true;
      }
    } catch (error) {
      console.log('Supabase client creation failed, using fallback:', error);
      supabaseConfigured = false;
    }

    // If Supabase is configured, use it for password reset verification
    if (supabaseConfigured && supabase) {
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
    } else {
      // Supabase not configured - use mock implementation for development
      console.log('Supabase not configured, using mock implementation for development');
      
      const { mockDb, initializeMockData } = await import('@/server/mock-db');
      initializeMockData();

      // Verify OTP in mock database
      const otpRecord = mockDb.otpCodes.get(email);
      
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, message: 'No reset code found for this email' },
          { status: 400 }
        );
      }

      // Check if OTP matches
      if (otpRecord.code !== otp) {
        return NextResponse.json(
          { success: false, message: 'Invalid reset code' },
          { status: 400 }
        );
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        // Clean up expired OTP
        mockDb.otpCodes.delete(email);
        return NextResponse.json(
          { success: false, message: 'Reset code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Find and update user password in mock database
      const user = Array.from(mockDb.users.values()).find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Update password (in a real app, this would be hashed)
      user.password = newPassword;
      
      // Clean up OTP after successful reset
      mockDb.otpCodes.delete(email);

      return NextResponse.json(
        {
          success: true,
          message: 'Password reset successful! You can now sign in with your new password.',
          data: {
            message: 'Password updated in development database'
          }
        },
        { status: 200 }
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
