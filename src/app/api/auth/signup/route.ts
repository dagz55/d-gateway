import { initializeMockData, mockDb } from '@/server/mock-db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize mock data if not already done
initializeMockData();

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

    // Check if user already exists
    const existingUser = Array.from(mockDb.users.values()).find(
      user => user.email === email || user.username === username
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const userId = (mockDb.users.size + 1).toString();
    const newUser = {
      id: userId,
      email,
      username,
      fullName,
      age: 25, // Default age
      gender: 'PREFER_NOT_TO_SAY' as const,
      traderLevel: 'BEGINNER' as const,
      accountBalance: 0,
      isVerified: false,
      package: 'BASIC' as const,
      status: 'OFFLINE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user in mock database
    mockDb.users.set(userId, newUser);

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    mockDb.otpCodes.set(email, {
      code: otp,
      expiresAt,
      email,
    });

    // In a real app, you would send the OTP via email
    // For development, we'll return it in the response
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully. Please check your email for OTP.',
        data: {
          userId,
          otp, // Only for development - remove in production
          message: 'OTP sent to your email for verification'
        }
      },
      { status: 201 }
    );
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
