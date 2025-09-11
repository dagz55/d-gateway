import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);

    // Try to create Supabase client
    let supabase;
    let supabaseConfigured = false;
    
    try {
      // Check if Supabase environment variables are properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-') &&
          process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-')) {
        
        supabase = await createClient();
        supabaseConfigured = true;
        console.log('Supabase client created successfully');
      } else {
        console.log('Supabase environment variables not properly configured, using fallback');
        supabaseConfigured = false;
      }
    } catch (error) {
      console.log('Supabase client creation failed, using fallback:', error);
      supabaseConfigured = false;
    }

    // If Supabase is configured, use it for password reset
    if (supabaseConfigured && supabase) {
      // Get the origin for the redirect URL
      const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const redirectTo = `${origin}/reset-password/confirm`;

      // Use Supabase Auth to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        
        // Handle specific error cases
        if (error.message.includes('not found') || error.status === 404) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'If an account exists with this email, you will receive a password reset link.' 
            },
            { status: 200 } // Return 200 to prevent email enumeration
          );
        }

        return NextResponse.json(
          { success: false, message: 'Failed to send password reset email. Please try again.' },
          { status: 500 }
        );
      }

      // Success - email sent via Supabase
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.',
          data: {
            message: 'Password reset email sent successfully'
          }
        },
        { status: 200 }
      );
    } else {
      // Supabase not configured - use mock implementation for development
      console.log('Supabase not configured, using mock implementation for development');
      
      const { mockDb, initializeMockData } = await import('@/server/mock-db');
      initializeMockData();
      
      // Check if user exists in mock database
      const user = Array.from(mockDb.users.values()).find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found in development database' },
          { status: 404 }
        );
      }

      // Generate OTP for password reset (development only)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      mockDb.otpCodes.set(email, {
        code: otp,
        expiresAt,
        email,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Development mode: OTP generated (Supabase not configured)',
          data: {
            otp, // Only for development
            message: 'OTP generated for development testing',
            note: 'Configure Supabase to enable email sending'
          }
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    
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
