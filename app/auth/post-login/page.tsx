'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function PostLoginClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return; // wait for Clerk to hydrate

    // Prevent immediate redirect on first load to avoid race conditions
    if (!hasInitialized) {
      // Give Clerk additional time to fully hydrate (especially important after OAuth flow)
      setTimeout(() => {
        setHasInitialized(true);
      }, 1000);
      return;
    }

    if (!isSignedIn) {
      console.log('Post-login: No user found after hydration, redirecting to sign-in');
      router.replace('/sign-in');
      return;
    }

    const meta = user?.publicMetadata as any;
    const isAdmin = meta?.role === 'admin';
    console.log('Post-login routing:', {
      isLoaded,
      isSignedIn,
      userPublicMetadata: user?.publicMetadata,
      derivedIsAdmin: isAdmin,
    });

    const destination = isAdmin ? '/admin/dashboard' : '/member/dashboard';
    router.replace(destination);
  }, [isLoaded, isSignedIn, user, router, hasInitialized]);

  // Minimal skeleton while routing
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9aa4b2' }}>
        {!isLoaded || !hasInitialized
          ? 'Loading authentication...'
          : 'Determining your destination…'
        }
      </div>
    </div>
  );
}
