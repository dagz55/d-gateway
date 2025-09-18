'use client';

import { Toaster } from '@/components/ui/sonner';
import { suppressExtensionErrors } from '@/lib/suppress-extension-errors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkOSAuthProvider } from '@/contexts/WorkOSAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    // Suppress browser extension errors
    suppressExtensionErrors();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkOSAuthProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </WorkOSAuthProvider>
    </QueryClientProvider>
  );
}
