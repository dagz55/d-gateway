import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Server-side authentication helper that redirects unauthenticated users
 * @param redirectTo - Optional redirect path (defaults to '/sign-in')
 * @returns Promise<string> - The authenticated user's ID
 */
export async function requireAuth(redirectTo: string = '/sign-in'): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    redirect(redirectTo);
  }

  return userId;
}

/**
 * Server-side authentication helper that returns null for unauthenticated users
 * @returns Promise<string | null> - The authenticated user's ID or null
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Server-side authentication helper with custom redirect logic
 * @param options - Configuration options
 * @returns Promise<string> - The authenticated user's ID
 */
export async function requireAuthWithOptions(options: {
  redirectTo?: string;
  allowGuest?: boolean;
} = {}): Promise<string> {
  const { redirectTo = '/sign-in', allowGuest = false } = options;
  const { userId } = await auth();

  if (!userId && !allowGuest) {
    redirect(redirectTo);
  }

  if (!userId && allowGuest) {
    throw new Error('Authentication required but guest access was requested');
  }

  return userId!;
}
