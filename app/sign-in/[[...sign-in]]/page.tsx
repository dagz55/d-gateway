'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the working custom sign-in page
    router.replace('/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#33E1DA] mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Redirecting to sign-in...</p>
      </div>
    </div>
  );
}