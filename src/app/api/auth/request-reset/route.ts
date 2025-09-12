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

    // Create Supabase client
    const supabase = await createClient();
    
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
