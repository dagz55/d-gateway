'use client';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { suppressExtensionErrors } from '@/lib/suppress-extension-errors';
import { SupabaseAuthProvider } from '@/providers/supabase-auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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
      <SupabaseAuthProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
