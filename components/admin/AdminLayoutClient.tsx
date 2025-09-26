'use client';

import React from 'react';
import { AdminUser } from '@/lib/admin';
import AppLayout from '@/components/layout/AppLayout';
import useAdminErrorHandler, { useAdminPageTimeout } from '@/hooks/useAdminErrorHandler';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminUser: AdminUser;
}

export default function AdminLayoutClient({ children, adminUser }: AdminLayoutClientProps) {
  // Initialize admin error handling
  const {
    isLoading,
    hasError,
    errorCount,
    lastError,
    retryCount,
    maxRetries,
    canRetry,
    startLoading,
    stopLoading,
    retry,
    resetError
  } = useAdminErrorHandler({
    enabled: true,
    maxRetries: 3,
    retryDelay: 2000,
    timeoutThreshold: 30000,
    enableGlobalErrorHandler: true,
    enableTimeoutDetection: true,
    fallbackUrl: '/admin/fallback'
  });

  // Page timeout detection
  const { hasTimedOut } = useAdminPageTimeout(15000);

  // Start loading detection on mount
  React.useEffect(() => {
    startLoading();
    
    // Simulate completion after a short delay to detect successful page loads
    const timer = setTimeout(() => {
      stopLoading();
    }, 1000);

    return () => clearTimeout(timer);
  }, [startLoading, stopLoading]);

  // Monitor for admin panel specific errors
  React.useEffect(() => {
    // Add any admin-specific error monitoring here
    console.log('Admin Layout: Error Handler Status', {
      hasError,
      errorCount,
      retryCount,
      canRetry,
      isLoading
    });
  }, [hasError, errorCount, retryCount, canRetry, isLoading]);

  if (hasTimedOut) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout isAdmin>
      {children}
      
      {/* Development error indicator */}
      {process.env.NODE_ENV === 'development' && (hasError || errorCount > 0) && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs">
            <div className="text-red-400 font-medium">Admin Error Handler</div>
            <div className="text-muted-foreground">
              Errors: {errorCount} | Retries: {retryCount}/{maxRetries}
            </div>
            {lastError && (
              <div className="text-muted-foreground truncate max-w-48">
                {lastError}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              {canRetry && (
                <button
                  onClick={retry}
                  className="text-xs bg-accent/20 hover:bg-accent/30 px-2 py-1 rounded"
                >
                  Retry
                </button>
              )}
              <button
                onClick={resetError}
                className="text-xs bg-muted/20 hover:bg-muted/30 px-2 py-1 rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
