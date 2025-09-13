import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    const supabase = await createClient();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, message: 'Login failed' },
        { status: 401 }
      );
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('Profile fetch error:', profileError);
      // Continue without profile data if table doesn't exist yet
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        profile: profile || null,
        session: data.session,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Validation error';
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