'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { suppressExtensionErrors } from '@/lib/suppress-extension-errors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { clerkAppearance } from '@/lib/clerk-theme';
import { LoadingProvider } from '@/contexts/LoadingContext';

// Simplified Clerk provider with fixed dark theme to prevent hooks issues
function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      // Disable organization features to prevent 403 errors
      allowOrganizationCreation={false}
      allowOrganizationInvitation={false}
    >
      {children}
    </ClerkProvider>
  );
}

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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProviderWrapper>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            {children}
            <Toaster />
          </LoadingProvider>
        </QueryClientProvider>
      </ClerkProviderWrapper>
    </ThemeProvider>
  );
}