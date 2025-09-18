'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';

// Token rotation configuration
const ROTATION_CONFIG = {
  CHECK_INTERVAL: 60 * 1000, // Check every minute
  REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  STORAGE_KEY: 'token_rotation_state',
} as const;

// Token rotation state interface
interface TokenRotationState {
  isRotating: boolean;
  lastRotation: number | null;
  retryCount: number;
  lastError: string | null;
  accessTokenExpiry: number | null;
  refreshTokenExpiry: number | null;
}

// Token rotation response interface
interface TokenRotationResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: string;
  rotated: boolean;
}

// Token status interface
interface TokenStatus {
  hasRefreshToken: boolean;
  canRefresh: boolean;
  expiresAt: number | null;
}

/**
 * Custom hook for automatic token rotation with refresh token flow
 */
export function useTokenRotation() {
  const { user, isAuthenticated, makeAuthenticatedRequest } = useWorkOSAuth();
  
  // State management
  const [rotationState, setRotationState] = useState<TokenRotationState>({
    isRotating: false,
    lastRotation: null,
    retryCount: 0,
    lastError: null,
    accessTokenExpiry: null,
    refreshTokenExpiry: null,
  });

  // Refs for cleanup and persistence
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotationInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Check token status from the server
   */
  const checkTokenStatus = useCallback(async (): Promise<TokenStatus | null> => {
    try {
      const response = await fetch('/api/auth/workos/refresh', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.warn('Token status check failed:', error);
      return null;
    }
  }, []);

  /**
   * Perform token rotation
   */
  const rotateTokens = useCallback(async (forceRotation = false): Promise<{
    success: boolean;
    error?: string;
    tokens?: TokenRotationResponse;
  }> => {
    // Prevent concurrent rotations
    if (rotationInProgressRef.current) {
      return { success: false, error: 'Rotation already in progress' };
    }

    try {
      rotationInProgressRef.current = true;

      if (!mountedRef.current) {
        return { success: false, error: 'Component unmounted' };
      }

      setRotationState(prev => ({
        ...prev,
        isRotating: true,
        lastError: null,
      }));

      // Check if we should rotate
      if (!forceRotation) {
        const tokenStatus = await checkTokenStatus();
        if (!tokenStatus || !tokenStatus.canRefresh) {
          setRotationState(prev => ({
            ...prev,
            isRotating: false,
            lastError: 'Cannot refresh token',
          }));
          return { success: false, error: 'Cannot refresh token' };
        }

        // Check if rotation is needed
        if (tokenStatus.expiresAt) {
          const timeUntilExpiry = tokenStatus.expiresAt - Date.now();
          if (timeUntilExpiry > ROTATION_CONFIG.REFRESH_BEFORE_EXPIRY) {
            setRotationState(prev => ({
              ...prev,
              isRotating: false,
            }));
            return { success: true, error: 'Token rotation not needed yet' };
          }
        }
      }

      // Perform token rotation
      const response = await fetch('/api/auth/workos/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        
        throw new Error(errorMessage);
      }

      const tokens: TokenRotationResponse = await response.json();

      if (!mountedRef.current) {
        return { success: false, error: 'Component unmounted during rotation' };
      }

      // Update rotation state
      const now = Date.now();
      setRotationState(prev => ({
        ...prev,
        isRotating: false,
        lastRotation: now,
        retryCount: 0,
        lastError: null,
        accessTokenExpiry: now + (tokens.expiresIn * 1000),
        refreshTokenExpiry: now + (tokens.refreshExpiresIn * 1000),
      }));

      // Store state in localStorage for persistence
      try {
        localStorage.setItem(ROTATION_CONFIG.STORAGE_KEY, JSON.stringify({
          lastRotation: now,
          accessTokenExpiry: now + (tokens.expiresIn * 1000),
          refreshTokenExpiry: now + (tokens.refreshExpiresIn * 1000),
        }));
      } catch (error) {
        console.warn('Failed to store rotation state:', error);
      }

      return { success: true, tokens };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token rotation failed';
      
      console.warn('Token rotation failed:', errorMessage);

      if (!mountedRef.current) {
        return { success: false, error: 'Component unmounted' };
      }

      setRotationState(prev => ({
        ...prev,
        isRotating: false,
        retryCount: prev.retryCount + 1,
        lastError: errorMessage,
      }));

      return { success: false, error: errorMessage };
    } finally {
      rotationInProgressRef.current = false;
    }
  }, [checkTokenStatus]);

  /**
   * Check if tokens need rotation
   */
  const checkAndRotateIfNeeded = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const tokenStatus = await checkTokenStatus();
      
      if (!tokenStatus || !tokenStatus.canRefresh) {
        return;
      }

      // Calculate time until expiry
      if (tokenStatus.expiresAt) {
        const timeUntilExpiry = tokenStatus.expiresAt - Date.now();
        
        // Rotate if within the refresh window
        if (timeUntilExpiry <= ROTATION_CONFIG.REFRESH_BEFORE_EXPIRY) {
          await rotateTokens();
        }
      }
    } catch (error) {
      console.warn('Token check failed:', error);
    }
  }, [isAuthenticated, user, checkTokenStatus, rotateTokens]);

  /**
   * Manual token rotation trigger
   */
  const forceRotation = useCallback(() => {
    return rotateTokens(true);
  }, [rotateTokens]);

  /**
   * Revoke all tokens (logout)
   */
  const revokeTokens = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/workos/refresh', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setRotationState({
          isRotating: false,
          lastRotation: null,
          retryCount: 0,
          lastError: null,
          accessTokenExpiry: null,
          refreshTokenExpiry: null,
        });

        // Clear stored state
        try {
          localStorage.removeItem(ROTATION_CONFIG.STORAGE_KEY);
        } catch (error) {
          console.warn('Failed to clear rotation state:', error);
        }

        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Revocation failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Revocation failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Get token expiry information
   */
  const getTokenExpiry = useCallback(() => {
    return {
      accessTokenExpiry: rotationState.accessTokenExpiry,
      refreshTokenExpiry: rotationState.refreshTokenExpiry,
      shouldRefresh: rotationState.accessTokenExpiry 
        ? (rotationState.accessTokenExpiry - Date.now()) <= ROTATION_CONFIG.REFRESH_BEFORE_EXPIRY
        : false,
    };
  }, [rotationState.accessTokenExpiry, rotationState.refreshTokenExpiry]);

  // Initialize rotation state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROTATION_CONFIG.STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setRotationState(prev => ({
          ...prev,
          lastRotation: parsedState.lastRotation,
          accessTokenExpiry: parsedState.accessTokenExpiry,
          refreshTokenExpiry: parsedState.refreshTokenExpiry,
        }));
      }
    } catch (error) {
      console.warn('Failed to load rotation state from storage:', error);
    }
  }, []);

  // Set up automatic token rotation interval
  useEffect(() => {
    if (isAuthenticated && user) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        checkAndRotateIfNeeded();
      }, ROTATION_CONFIG.CHECK_INTERVAL);

      // Initial check
      checkAndRotateIfNeeded();
    } else {
      // Clear interval when not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, checkAndRotateIfNeeded]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Return hook interface
  return {
    // State
    rotationState,
    
    // Actions
    forceRotation,
    revokeTokens,
    checkTokenStatus,
    
    // Utilities
    getTokenExpiry,
    
    // Status checks
    isRotating: rotationState.isRotating,
    canRotate: isAuthenticated && !!user,
    hasError: !!rotationState.lastError,
    retryCount: rotationState.retryCount,
    lastError: rotationState.lastError,
  };
}