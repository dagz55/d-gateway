'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function PostLoginClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return; // wait for Clerk to hydrate

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    const meta = user?.publicMetadata as any;
    const isAdmin = meta?.role === 'admin';
    console.log('Post-login check:', {
      isLoaded,
      isSignedIn,
      userPublicMetadata: user?.publicMetadata,
      derivedIsAdmin: isAdmin,
    });
    router.replace(isAdmin ? '/admin/dashboard' : '/member/dashboard');
  }, [isLoaded, isSignedIn, user, router]);

  // Minimal skeleton while routing
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9aa4b2' }}>Determining your destination…</div>
    </div>
  );
}
