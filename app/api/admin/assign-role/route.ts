import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const isCurrentUserAdmin = currentUser.publicMetadata?.role === 'admin';

    if (!isCurrentUserAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetUserId, role } = await request.json();

    if (!targetUserId || !role) {
      return NextResponse.json({ error: 'Missing targetUserId or role' }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "admin" or "member"' }, { status: 400 });
    }

    // Update user role
    await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: {
        ...currentUser.publicMetadata,
        role: role
      }
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      targetUserId,
      role
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}