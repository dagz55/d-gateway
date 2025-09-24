import { createClerkClient } from '@clerk/backend';

export interface ClerkUserData {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  createdAt: Date;
  lastSignInAt: Date | null;
  imageUrl: string;
}

function mapClerkUser(user: any): ClerkUserData {
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin:
      user.publicMetadata?.role === 'admin' ||
      (user as any)?.organizationMemberships?.some((membership: any) => membership.role === 'admin') ||
      false,
    createdAt: new Date(user.createdAt),
    lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    imageUrl: user.imageUrl
  };
}

/**
 * Fetch all users from Clerk API
 */
export async function getAllClerkUsers(): Promise<ClerkUserData[]> {
  try {
    // Check environment variables first
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn('CLERK_SECRET_KEY not found in environment variables');
      return [];
    }

    // Create a dedicated Clerk client to ensure proper initialization
    const client = createClerkClient({ secretKey });

    const response = await client.users.getUserList({
      limit: 500, // Adjust as needed
      orderBy: '-created_at'
    });

    return response.data.map(mapClerkUser);
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

/**
 * Fetch a single Clerk user by ID
 */
export async function getClerkUserById(userId: string): Promise<ClerkUserData | null> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn('CLERK_SECRET_KEY not found in environment variables');
      return null;
    }

    const client = createClerkClient({ secretKey });
    const user = await client.users.getUser(userId);

    if (!user) {
      console.error(`Clerk user not found for ID: ${userId}`);
      return null;
    }

    return mapClerkUser(user);
  } catch (error) {
    console.error(`Error fetching Clerk user by ID ${userId}:`, error);
    return null;
  }
}

/**
 * Get Clerk user count statistics
 */
export async function getClerkUserStats() {
  try {
    const users = await getAllClerkUsers();

    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.isAdmin).length;
    const memberUsers = totalUsers - adminUsers;

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignIns = users.filter(user =>
      user.lastSignInAt && user.lastSignInAt > sevenDaysAgo
    ).length;

    const recentSignUps = users.filter(user =>
      user.createdAt > sevenDaysAgo
    ).length;

    return {
      totalUsers,
      adminUsers,
      memberUsers,
      recentSignIns,
      recentSignUps
    };
  } catch (error) {
    console.error('Error getting Clerk user stats:', error);
    return {
      totalUsers: 0,
      adminUsers: 0,
      memberUsers: 0,
      recentSignIns: 0,
      recentSignUps: 0
    };
  }
}