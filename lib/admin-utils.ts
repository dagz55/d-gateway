import { User } from '@clerk/nextjs';

/**
 * Type-safe utility functions for admin-related operations
 */

export interface AdminCheckResult {
  isAdmin: boolean;
  user: User | null;
}

/**
 * Check if a user has admin privileges using Clerk's publicMetadata
 * @param user - Clerk user object
 * @returns AdminCheckResult with isAdmin boolean and user object
 */
export function checkAdminStatus(user: User | null): AdminCheckResult {
  if (!user) {
    return { isAdmin: false, user: null };
  }

  const isAdmin = user.publicMetadata?.isAdmin === true || user.publicMetadata?.role === 'admin';
  return { isAdmin, user };
}

/**
 * Get admin navigation items for sidebar
 * @param isAdmin - Whether the user is an admin
 * @returns Array of admin navigation items
 */
export function getAdminNavigationItems(isAdmin: boolean) {
  if (!isAdmin) {
    return [];
  }

  return [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: 'Shield', // This will be imported as needed
      isAdmin: true,
    },
  ];
}
