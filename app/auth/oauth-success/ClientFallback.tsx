'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientFallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    // Try immediate redirect
    const isAdmin = user.publicMetadata?.role === 'admin';
    console.log('Client Fallback - User role:', { isAdmin, metadata: user.publicMetadata });

    if (isAdmin) {
      router.replace('/dashboard/admins');
    } else {
      router.replace('/dashboard/members');
    }
  }, [user, isLoaded, router]);

  // Countdown timer fallback
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Force redirect to member dashboard after countdown
      console.warn('Fallback timeout reached, redirecting to member dashboard');
      router.replace('/dashboard/members');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white">Setting up your account...</p>
        <p className="text-white/60 text-sm mt-2">
          {countdown > 0 ? `Redirecting in ${countdown}s...` : 'Redirecting now...'}
        </p>
        {countdown <= 3 && (
          <button
            onClick={() => router.replace('/dashboard/members')}
            className="mt-4 px-4 py-2 bg-[#33E1DA] text-black rounded hover:bg-[#33E1DA]/80 transition-colors"
          >
            Continue to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}