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

    // Mock login - in a real app, you would validate credentials against database
    // For now, we'll just check if password is not empty
    if (!password || password.length < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Mock user data
    const mockUser = {
      id: '1',
      email,
      username: 'testuser',
      fullName: 'Test User',
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockUser,
        profile: mockUser,
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
        },
      },
    });
  } catch (error) {
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