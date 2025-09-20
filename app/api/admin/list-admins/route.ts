import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
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

    // Get all users and filter for admins
    const users = await clerkClient.users.getUserList({
      limit: 500 // Adjust based on your needs
    });

    const adminUsers = users.data.filter(user =>
      user.publicMetadata?.role === 'admin'
    ).map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || 'No email',
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt
    }));

    return NextResponse.json({
      success: true,
      adminCount: adminUsers.length,
      admins: adminUsers
    });

  } catch (error) {
    console.error('Error listing admins:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}