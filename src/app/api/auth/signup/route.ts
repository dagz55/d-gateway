import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const { fullName, username, email, password } = validatedData;

    const supabase = await createClient();

    // Check if user already exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 400 }
      );
    }

    if (authData.user) {
      return NextResponse.json(
        {
          success: true,
          message: 'User registered successfully. Please check your email to verify your account.',
          data: {
            userId: authData.user.id,
            message: 'Verification email sent to your email address'
          }
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Validation error';
      return NextResponse.json(
        { success: false, message: errorMessage, errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
