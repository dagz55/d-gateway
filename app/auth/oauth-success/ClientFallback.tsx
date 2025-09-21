'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientFallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Suppress browser extension errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Suppress common browser extension errors
      if (event.message?.includes('message channel closed') ||
          event.message?.includes('Extension context invalidated') ||
          event.filename?.includes('extension')) {
        event.preventDefault();
        return true;
      }
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      // Suppress Chrome extension promise rejections
      if (event.reason?.message?.includes('message channel closed') ||
          event.reason?.message?.includes('Extension context invalidated')) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
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
    } catch (error) {
      console.warn('Navigation error caught, falling back to countdown:', error);
    }
  }, [user, isLoaded, router]);

  // Countdown timer fallback
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Force redirect to member dashboard after countdown
      try {
        console.warn('Fallback timeout reached, redirecting to member dashboard');
        router.replace('/dashboard/members');
      } catch (error) {
        console.error('Failed to redirect after timeout:', error);
        // Fallback to window location if router fails
        window.location.href = '/dashboard/members';
      }
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
            onClick={() => {
              try {
                router.replace('/dashboard/members');
              } catch (error) {
                console.error('Manual redirect failed, using window.location:', error);
                window.location.href = '/dashboard/members';
              }
            }}
            className="mt-4 px-4 py-2 bg-[#33E1DA] text-black rounded hover:bg-[#33E1DA]/80 transition-colors"
          >
            Continue to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}