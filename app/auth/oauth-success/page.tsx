import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses server-side authentication
export const dynamic = 'force-dynamic';

import ClientFallback from './ClientFallback';
import { ErrorBoundary } from './ErrorBoundary';

export default async function OAuthSuccessPage() {
  try {
    const user = await currentUser();

    if (!user) {
      // User not authenticated, redirect to sign in
      redirect('/sign-in');
    }

    // Check if user is admin (matching middleware logic exactly)
    const isAdmin =
      user.publicMetadata?.role === 'admin' ||
      (user as any)?.metadata?.role === 'admin' ||
      (user as any)?.role === 'admin' ||
      (user as any)?.org_role === 'admin' ||
      (user as any)?.orgMetadata?.role === 'admin';

    // Log for debugging (server-side)
    console.log('OAuth Success (Server) - User role check:', {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      publicMetadata: user.publicMetadata,
      isAdmin,
      allMetadata: {
        publicMetadata: user.publicMetadata,
        metadata: (user as any)?.metadata,
        role: (user as any)?.role,
        org_role: (user as any)?.org_role,
        orgMetadata: (user as any)?.orgMetadata
      }
    });

    // Redirect based on role
    if (isAdmin) {
      console.log('Redirecting admin to /dashboard/admins');
      redirect('/dashboard/admins');
    } else {
      console.log('Redirecting member to /dashboard/members');
      redirect('/dashboard/members');
    }
  } catch (error) {
    console.error('OAuth Success error:', error);
    // Fallback to client-side handling if server-side fails
    return (
      <ErrorBoundary>
        <ClientFallback />
      </ErrorBoundary>
    );
  }

  // This should never be reached, but provide fallback just in case
  return (
    <ErrorBoundary>
      <ClientFallback />
    </ErrorBoundary>
  );
}