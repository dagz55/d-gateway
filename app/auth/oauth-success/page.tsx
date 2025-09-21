'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuthSuccessPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // User not authenticated, redirect to sign in
      router.replace('/sign-in');
      return;
    }

    // Check if user is admin
    const isAdmin = user.publicMetadata?.role === 'admin';

    // Redirect based on role
    if (isAdmin) {
      router.replace('/dashboard/admins');
    } else {
      router.replace('/dashboard/members');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white">Setting up your account...</p>
      </div>
    </div>
  );
}