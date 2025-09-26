'use client';

import { useState, useCallback, useRef } from 'react';
import { errorHandler, RetryConfig } from '@/lib/error-handling';

interface ApiErrorState {
  hasError: boolean;
  error: Error | null;
  userMessage: string;
  errorId: string | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseApiErrorHandlerOptions {
  retryConfig?: RetryConfig;
  onError?: (error: Error, userMessage: string) => void;
  onRetry?: (retryCount: number) => void;
  onSuccess?: () => void;
}

export function useApiErrorHandler(options: UseApiErrorHandlerOptions = {}) {
  const {
    retryConfig,
    onError,
    onRetry,
    onSuccess,
  } = options;

  const [state, setState] = useState<ApiErrorState>({
    hasError: false,
    error: null,
    userMessage: '',
    errorId: null,
    isRetrying: false,
    retryCount: 0,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const operationRef = useRef<(() => Promise<any>) | null>(null);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
      error: null,
      userMessage: '',
      errorId: null,
      retryCount: 0,
    }));
  }, []);

  const handleError = useCallback((error: any, context: Record<string, any> = {}) => {
    const { userMessage, shouldRetry, errorId } = errorHandler.handleApiError(error, context);
    
    setState(prev => ({
      ...prev,
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
      userMessage,
      errorId,
    }));

    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)), userMessage);
    }

    return { userMessage, shouldRetry, errorId };
  }, [onError]);

  const retry = useCallback(async (operation: () => Promise<any>, maxRetries?: number) => {
    if (state.isRetrying) return;

    const config = retryConfig || {
      maxRetries: maxRetries || 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };

    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    operationRef.current = operation;

    try {
      const result = await errorHandler.retry(operation, 'api', {
        action: 'api_retry',
        additionalData: { retryCount: state.retryCount + 1 },
      });

      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        userMessage: '',
        errorId: null,
        isRetrying: false,
      }));

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error) {
      const { userMessage, errorId } = handleError(error, {
        action: 'api_retry_failed',
        additionalData: { retryCount: state.retryCount + 1 },
      });

      setState(prev => ({
        ...prev,
        isRetrying: false,
        userMessage,
        errorId,
      }));

      throw error;
    }
  }, [state.isRetrying, state.retryCount, retryConfig, handleError, onSuccess]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> => {
    try {
      clearError();
      const result = await operation();
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [clearError, handleError, onSuccess]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> => {
    try {
      clearError();
      return await retry(operation, maxRetries);
    } catch (error) {
      throw error;
    }
  }, [clearError, retry]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    // State
    hasError: state.hasError,
    error: state.error,
    userMessage: state.userMessage,
    errorId: state.errorId,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,

    // Actions
    clearError,
    handleError,
    retry,
    executeWithErrorHandling,
    executeWithRetry,
    cleanup,

    // Utilities
    isNetworkError: state.error?.message?.includes('fetch') || 
                   state.error?.message?.includes('network') ||
                   state.error?.message?.includes('timeout'),
    isServerError: state.error?.message?.includes('500') ||
                  state.error?.message?.includes('502') ||
                  state.error?.message?.includes('503') ||
                  state.error?.message?.includes('504'),
    canRetry: state.retryCount < (retryConfig?.maxRetries || 3),
  };
}

// Specialized hook for API calls
export function useApiCall<T = any>(options: UseApiErrorHandlerOptions = {}) {
  const errorHandler = useApiErrorHandler(options);

  const call = useCallback(async (
    apiCall: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> => {
    return errorHandler.executeWithErrorHandling(apiCall, context);
  }, [errorHandler]);

  const callWithRetry = useCallback(async (
    apiCall: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> => {
    return errorHandler.executeWithRetry(apiCall, maxRetries);
  }, [errorHandler]);

  return {
    ...errorHandler,
    call,
    callWithRetry,
  };
}

// Hook for handling form submissions with error handling
export function useFormErrorHandler(options: UseApiErrorHandlerOptions = {}) {
  const errorHandler = useApiErrorHandler(options);

  const submit = useCallback(async <T>(
    submitFn: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T | null> => {
    try {
      return await errorHandler.executeWithErrorHandling(submitFn, {
        ...context,
        action: 'form_submit',
      });
    } catch (error) {
      // Error is already handled by executeWithErrorHandling
      return null;
    }
  }, [errorHandler]);

  const submitWithRetry = useCallback(async <T>(
    submitFn: () => Promise<T>,
    maxRetries?: number
  ): Promise<T | null> => {
    try {
      return await errorHandler.executeWithRetry(submitFn, maxRetries);
    } catch (error) {
      // Error is already handled by executeWithRetry
      return null;
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    submit,
    submitWithRetry,
  };
}
