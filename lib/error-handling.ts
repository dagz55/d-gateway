/**
 * Comprehensive Error Handling Utilities
 * Provides centralized error handling, logging, and user feedback
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  type: 'network' | 'component' | 'data' | 'api' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  timestamp: number;
  resolved: boolean;
  retryCount: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorLog[] = [];
  private maxLogSize = 100;
  private retryConfigs: Map<string, RetryConfig> = new Map();

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Log an error with context
   */
  public logError(
    error: Error | string,
    type: ErrorLog['type'] = 'unknown',
    context: ErrorContext = {},
    severity: ErrorLog['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;

    const errorLog: ErrorLog = {
      id: errorId,
      message: errorMessage,
      stack,
      type,
      severity,
      context: {
        ...context,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: Date.now(),
      resolved: false,
      retryCount: 0,
    };

    // Add to log
    this.errorLog.unshift(errorLog);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandler] ${severity.toUpperCase()} ${type.toUpperCase()}:`, {
        id: errorId,
        message: errorMessage,
        context,
        stack,
      });
    }

    // Send to backend in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(errorLog).catch(console.error);
    }

    return errorId;
  }

  /**
   * Retry an operation with exponential backoff
   */
  public async retry<T>(
    operation: () => Promise<T>,
    configKey: string = 'default',
    context: ErrorContext = {}
  ): Promise<T> {
    const config = this.retryConfigs.get(configKey) || this.getDefaultRetryConfig();
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(lastError)) {
          throw lastError;
        }

        // Don't retry on the last attempt
        if (attempt === config.maxRetries) {
          this.logError(lastError, 'api', {
            ...context,
            action: 'retry_failed',
            additionalData: { attempts: attempt + 1, configKey }
          }, 'high');
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        // Log retry attempt
        this.logError(lastError, 'api', {
          ...context,
          action: 'retry_attempt',
          additionalData: { attempt: attempt + 1, delay, configKey }
        }, 'low');

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Handle API errors with appropriate user feedback
   */
  public handleApiError(
    error: any,
    context: ErrorContext = {}
  ): { userMessage: string; shouldRetry: boolean; errorId: string } {
    let userMessage = 'An unexpected error occurred';
    let shouldRetry = false;
    let severity: ErrorLog['severity'] = 'medium';

    if (error?.response?.status) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Please sign in to continue.';
          break;
        case 403:
          userMessage = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          shouldRetry = true;
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          shouldRetry = true;
          severity = 'high';
          break;
        case 502:
        case 503:
        case 504:
          userMessage = 'Service temporarily unavailable. Please try again.';
          shouldRetry = true;
          severity = 'high';
          break;
        default:
          userMessage = `Request failed with status ${status}`;
          shouldRetry = status >= 500;
      }
    } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      userMessage = 'Network error. Please check your connection.';
      shouldRetry = true;
      severity = 'medium';
    } else if (error?.name === 'AbortError') {
      userMessage = 'Request was cancelled.';
      shouldRetry = true;
    }

    const errorId = this.logError(error, 'api', context, severity);

    return { userMessage, shouldRetry, errorId };
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: ErrorLog[];
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errorLog.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recent: this.errorLog.slice(0, 10),
    };
  }

  /**
   * Clear resolved errors
   */
  public clearResolvedErrors(): void {
    this.errorLog = this.errorLog.filter(error => !error.resolved);
  }

  /**
   * Mark error as resolved
   */
  public resolveError(errorId: string): boolean {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Set retry configuration for specific operations
   */
  public setRetryConfig(key: string, config: RetryConfig): void {
    this.retryConfigs.set(key, config);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultRetryConfig(): RetryConfig {
    return {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        // Retry on network errors and 5xx status codes
        return error.message.includes('fetch') || 
               error.message.includes('network') ||
               error.message.includes('timeout');
      },
    };
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError(event.error, 'component', {
        component: 'global',
        action: 'unhandled_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      }, 'high');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, 'component', {
        component: 'global',
        action: 'unhandled_promise_rejection',
      }, 'high');
    });
  }

  private async sendToBackend(errorLog: ErrorLog): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (error) {
      // Don't log errors from error logging to avoid infinite loops
      console.warn('Failed to send error to backend:', error);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const logError = (
  error: Error | string,
  type: ErrorLog['type'] = 'unknown',
  context: ErrorContext = {},
  severity: ErrorLog['severity'] = 'medium'
) => errorHandler.logError(error, type, context, severity);

export const retry = <T>(
  operation: () => Promise<T>,
  configKey: string = 'default',
  context: ErrorContext = {}
) => errorHandler.retry(operation, configKey, context);

export const handleApiError = (error: any, context: ErrorContext = {}) =>
  errorHandler.handleApiError(error, context);

// React hook for error handling
export const useErrorHandler = () => {
  return {
    logError,
    retry,
    handleApiError,
    getErrorStats: () => errorHandler.getErrorStats(),
    clearResolvedErrors: () => errorHandler.clearResolvedErrors(),
    resolveError: (errorId: string) => errorHandler.resolveError(errorId),
    setRetryConfig: (key: string, config: RetryConfig) => errorHandler.setRetryConfig(key, config),
  };
};
