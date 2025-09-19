import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  return user;
}

export async function requireAuth() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}

export async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const isAdmin = user.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return user;
}

// Simple logging function to replace complex security logging
export function logSecurityEvent(event: string, details?: any) {
  console.log(`Security Event: ${event}`, details);
}