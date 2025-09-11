'use client';

import { useSession } from 'next-auth/react';

export function useUser() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    profile: session?.user || null, // Using user as profile for now
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
  };
}