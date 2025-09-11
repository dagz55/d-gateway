import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Mock logout - in a real app, you would invalidate the session
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}