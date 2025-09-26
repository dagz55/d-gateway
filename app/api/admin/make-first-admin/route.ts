import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Predefined admin emails for production
const ADMIN_EMAILS = [
  'dagz55@gmail.com',
  'admin@zignals.org'
];

// This endpoint allows setting up initial admin users
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({
      limit: 100
    });

    // Check existing admins
    const existingAdmins = users.data.filter(user =>
      user.publicMetadata?.role === 'admin'
    );

    // Get current user email
    const currentUser = users.data.find(user => user.id === userId);
    const currentUserEmail = currentUser?.emailAddresses[0]?.emailAddress;

    // Only allow predefined admin emails to use this endpoint
    if (!currentUserEmail || !ADMIN_EMAILS.includes(currentUserEmail)) {
      return NextResponse.json({
        error: 'Unauthorized: Only predefined admin emails can use this endpoint'
      }, { status: 403 });
    }

    const results = [];

    // Set admin role for all predefined admin emails that exist in the system
    for (const adminEmail of ADMIN_EMAILS) {
      const user = users.data.find(u =>
        u.emailAddresses.some(email => email.emailAddress === adminEmail)
      );

      if (user) {
        // Check if already admin
        const isAlreadyAdmin = user.publicMetadata?.role === 'admin';

        if (!isAlreadyAdmin) {
          await clerk.users.updateUser(user.id, {
            publicMetadata: {
              role: 'admin'
            }
          });
          results.push({ email: adminEmail, status: 'made_admin' });
        } else {
          results.push({ email: adminEmail, status: 'already_admin' });
        }
      } else {
        results.push({ email: adminEmail, status: 'user_not_found' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin setup completed',
      results,
      totalAdmins: existingAdmins.length + results.filter(r => r.status === 'made_admin').length
    });

  } catch (error) {
    console.error('Error setting up admins:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}