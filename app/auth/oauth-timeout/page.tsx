'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OAuthTimeoutPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    const maxAttempts = 3;

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    if (attempts < maxAttempts) {
      // Try role detection with increasing delay
      const delay = (attempts + 1) * 1000; // 1s, 2s, 3s delays

      setTimeout(() => {
        const isAdmin = user.publicMetadata?.role === 'admin';

        if (isAdmin) {
          router.replace('/dashboard/admins');
        } else {
          router.replace('/dashboard/members');
        }

        setAttempts(prev => prev + 1);
      }, delay);
    } else {
      // Fallback: redirect to member dashboard by default
      console.warn('OAuth timeout: falling back to member dashboard');
      router.replace('/dashboard/members');
    }
  }, [user, isLoaded, router, attempts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white">Finalizing your account setup...</p>
        <p className="text-white/60 text-sm mt-2">Attempt {attempts + 1} of 3</p>
        {attempts >= 2 && (
          <p className="text-white/40 text-xs mt-2">
            Taking longer than expected. Redirecting to default dashboard...
          </p>
        )}
      </div>
    </div>
  );
}