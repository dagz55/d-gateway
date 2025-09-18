'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  errorId: string;
}

interface AdminErrorHandlerOptions {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeoutThreshold?: number;
  enableGlobalErrorHandler?: boolean;
  enableTimeoutDetection?: boolean;
  fallbackUrl?: string;
}

interface AdminErrorHandlerState {
  isLoading: boolean;
  hasError: boolean;
  errorCount: number;
  lastError: string | null;
  timeoutCount: number;
}

export function useAdminErrorHandler(options: AdminErrorHandlerOptions = {}) {
  const {
    enabled = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeoutThreshold = 30000, // 30 seconds
    enableGlobalErrorHandler = true,
    enableTimeoutDetection = true,
    fallbackUrl = '/admin/fallback'
  } = options;

  const router = useRouter();
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<AdminErrorHandlerState>({
    isLoading: false,
    hasError: false,
    errorCount: 0,
    lastError: null,
    timeoutCount: 0
  });

  // Generate unique error ID
  const generateErrorId = useCallback(() => {
    return `admin_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Log error to backend
  const logError = useCallback(async (errorData: Partial<ErrorLogData>) => {
    if (!enabled) return;

    try {
      const fullErrorData: ErrorLogData = {
        message: errorData.message || 'Unknown admin error',
        stack: errorData.stack,
        componentStack: errorData.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorId: errorData.errorId || generateErrorId(),
        ...errorData
      };

      await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullErrorData),
      });

      console.log('Admin error logged:', fullErrorData.errorId);
    } catch (logError) {
      console.error('Failed to log admin error:', logError);
    }
  }, [enabled, generateErrorId]);

  // Handle admin panel timeout
  const handleTimeout = useCallback(() => {
    if (!enabled || !enableTimeoutDetection) return;

    setState(prev => ({
      ...prev,
      timeoutCount: prev.timeoutCount + 1,
      hasError: true,
      lastError: 'Admin panel load timeout'
    }));

    const errorId = generateErrorId();
    logError({
      message: 'Admin panel timeout detected',
      errorId,
      stack: `Timeout after ${timeoutThreshold}ms`
    });

    // Redirect to fallback if max timeouts reached
    if (state.timeoutCount >= maxRetries) {
      const params = new URLSearchParams({
        error: 'Admin panel timeout - redirected to fallback',
        errorId
      });
      router.push(`${fallbackUrl}?${params.toString()}`);
    }
  }, [
    enabled,
    enableTimeoutDetection,
    timeoutThreshold,
    maxRetries,
    state.timeoutCount,
    generateErrorId,
    logError,
    router,
    fallbackUrl
  ]);

  // Start loading with timeout detection
  const startLoading = useCallback(() => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true }));

    if (enableTimeoutDetection && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enableTimeoutDetection) {
      timeoutRef.current = setTimeout(handleTimeout, timeoutThreshold);
    }
  }, [enabled, enableTimeoutDetection, handleTimeout, timeoutThreshold]);

  // Stop loading (success)
  const stopLoading = useCallback(() => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: false, hasError: false }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset retry count on successful load
    retryCountRef.current = 0;
  }, [enabled]);

  // Handle admin error
  const handleError = useCallback(async (error: Error, errorInfo?: any) => {
    if (!enabled) return;

    retryCountRef.current++;
    const errorId = generateErrorId();

    setState(prev => ({
      ...prev,
      hasError: true,
      errorCount: prev.errorCount + 1,
      lastError: error.message,
      isLoading: false
    }));

    // Log the error
    await logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorId
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Redirect to fallback if max retries reached
    if (retryCountRef.current >= maxRetries) {
      const params = new URLSearchParams({
        error: error.message,
        errorId
      });
      
      setTimeout(() => {
        router.push(`${fallbackUrl}?${params.toString()}`);
      }, retryDelay);
    }
  }, [
    enabled,
    maxRetries,
    retryDelay,
    generateErrorId,
    logError,
    router,
    fallbackUrl
  ]);

  // Global error handler
  useEffect(() => {
    if (!enabled || !enableGlobalErrorHandler) return;

    const handleGlobalError = (event: ErrorEvent) => {
      // Check if it's an admin-related error
      const isAdminError = 
        window.location.pathname.startsWith('/admin') ||
        event.filename?.includes('admin') ||
        event.error?.stack?.includes('admin');

      if (isAdminError) {
        handleError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if it's an admin-related promise rejection
      const isAdminError = window.location.pathname.startsWith('/admin');

      if (isAdminError) {
        const error = event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason));
        
        handleError(error, { type: 'unhandledRejection' });
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enabled, enableGlobalErrorHandler, handleError]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
      lastError: null,
      errorCount: 0,
      timeoutCount: 0
    }));
    retryCountRef.current = 0;
  }, []);

  // Manual retry function
  const retry = useCallback(async () => {
    if (!enabled) return;

    resetError();
    
    try {
      startLoading();
      
      // Test admin panel accessibility
      const response = await fetch('/api/admin/health', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        stopLoading();
        // Reload the current admin page
        window.location.reload();
      } else {
        throw new Error('Admin panel health check failed');
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [enabled, resetError, startLoading, stopLoading, handleError]);

  return {
    // State
    ...state,
    retryCount: retryCountRef.current,
    
    // Actions
    handleError,
    startLoading,
    stopLoading,
    resetError,
    retry,
    
    // Configuration
    maxRetries,
    canRetry: retryCountRef.current < maxRetries
  };
}

// Hook for detecting page load timeouts specifically
export function useAdminPageTimeout(timeoutMs: number = 15000) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only apply timeout detection on admin pages
    if (!window.location.pathname.startsWith('/admin')) return;

    // Set timeout for page load
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      
      // Log timeout error
      console.error('Admin page load timeout detected');
      
      // Redirect to fallback
      const params = new URLSearchParams({
        error: 'Page load timeout',
        errorId: `timeout_${Date.now()}`
      });
      router.push(`/admin/fallback?${params.toString()}`);
    }, timeoutMs);

    // Cleanup timeout when page loads successfully
    const handleLoad = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        setHasTimedOut(false);
      }
    };

    // Listen for page load events
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('load', handleLoad);
    };
  }, [timeoutMs, router]);

  return { hasTimedOut };
}

export default useAdminErrorHandler;