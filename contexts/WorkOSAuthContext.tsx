'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTokenRotation } from '@/hooks/useTokenRotation';
import { sessionInvalidationManager } from '@/lib/session-invalidation';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  workos_user_id: string;
  user_id?: string;
  email: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
  package: string;
  trader_level: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface SessionInfo {
  sessionId?: string;
  sessionVersion?: number;
  deviceId?: string;
  expiresAt?: string;
  lastActivity?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'session_invalidation' | 'suspicious_activity' | 'device_change' | 'security_breach';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  dismissed: boolean;
  actionRequired?: boolean;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: () => void;
  }>;
}

interface WorkOSAuthContextType {
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  sessionInfo: SessionInfo | null;
  securityAlerts: SecurityAlert[];
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  dismissSecurityAlert: (alertId: string) => void;
  invalidateAllSessions: (excludeCurrent?: boolean) => Promise<boolean>;
  invalidateSession: (sessionId: string) => Promise<boolean>;
  // CSRF token management
  csrfToken: string | null;
  refreshCSRFToken: () => Promise<void>;
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
  // Token rotation management
  tokenRotation: {
    isRotating: boolean;
    canRotate: boolean;
    hasError: boolean;
    lastError: string | null;
    forceRotation: () => Promise<{ success: boolean; error?: string }>;
    revokeTokens: () => Promise<{ success: boolean; error?: string }>;
    getTokenExpiry: () => {
      accessTokenExpiry: number | null;
      refreshTokenExpiry: number | null;
      shouldRefresh: boolean;
    };
  };
}

const WorkOSAuthContext = createContext<WorkOSAuthContextType | undefined>(undefined);

export function WorkOSAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  // Token rotation will be handled separately to avoid circular dependency
  const tokenRotationHook = {
    isRotating: false,
    canRotate: false,
    hasError: false,
    lastError: null as string | null,
    forceRotation: async () => ({ success: false, error: 'Token rotation disabled in provider' }),
    revokeTokens: async () => ({ success: true }),
    getTokenExpiry: () => ({ shouldRefresh: false, expiresIn: 0, expiresAt: null }),
  };

  // CSRF token management
  const refreshCSRFToken = useCallback(async () => {
    try {
      // CSRF token is automatically managed by middleware and sent in response headers
      // We just need to check for it in responses
      const response = await fetch('/api/auth/workos/callback', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const token = response.headers.get('X-CSRF-Token');
      if (token) {
        setCSRFToken(token);
      }
    } catch (error) {
      console.warn('Failed to refresh CSRF token:', error);
    }
  }, []);

  // Enhanced request function with CSRF protection and automatic token refresh
  const makeAuthenticatedRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const method = options.method?.toUpperCase() || 'GET';
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    // Check if tokens need refresh before making the request
    const tokenExpiry = tokenRotationHook.getTokenExpiry();
    if (tokenExpiry.shouldRefresh && tokenRotationHook.canRotate && !tokenRotationHook.isRotating) {
      try {
        console.log('🔄 Auto-refreshing tokens before request...');
        const rotationResult = await tokenRotationHook.forceRotation();
        if (!rotationResult.success) {
          console.warn('Token refresh failed:', rotationResult.error);
        }
      } catch (refreshError) {
        console.warn('Token refresh error:', refreshError);
      }
    }

    // Prepare headers
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // Add CSRF token for state-changing requests
    if (isStateChanging && csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers
    });

    // Check for CSRF token in response and update if present
    const newToken = response.headers.get('X-CSRF-Token');
    if (newToken && newToken !== csrfToken) {
      setCSRFToken(newToken);
    }

    // Handle token expiration (401) by attempting token refresh
    if (response.status === 401 && tokenRotationHook.canRotate && !tokenRotationHook.isRotating) {
      try {
        console.log('🔄 Access token expired, attempting refresh...');
        const rotationResult = await tokenRotationHook.forceRotation();
        
        if (rotationResult.success) {
          // Retry the original request with new tokens
          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'include',
            headers
          });
          
          return retryResponse;
        } else {
          // Token refresh failed, user needs to re-authenticate
          console.warn('Token refresh failed, user needs to re-authenticate');
          setUser(null);
          setProfile(null);
          setSessionInfo(null);
          return response;
        }
      } catch (refreshError) {
        console.error('Token refresh error during request retry:', refreshError);
        return response;
      }
    }

    // Handle CSRF-specific errors
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.code === 'CSRF_INVALID' || errorData.code === 'CSRF_ERROR') {
        console.warn('CSRF token validation failed, refreshing token...');
        await refreshCSRFToken();
        throw new Error('CSRF token invalid - please retry the request');
      }
    }

    return response;
  }, [csrfToken, refreshCSRFToken]);

  const fetchUserProfile = async (workosUserId: string): Promise<UserProfile | null> => {
    try {
      setProfileLoading(true);
      
      // Use authenticated request function for CSRF protection and token refresh
      const response = await makeAuthenticatedRequest(`/api/auth/workos/profile?workos_user_id=${workosUserId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const profileData = await response.json();
        return profileData;
      } else {
        console.warn('Failed to fetch user profile from database:', response.status);
        return null;
      }
    } catch (error) {
      // Handle CSRF errors gracefully
      if (error instanceof Error && error.message.includes('CSRF token invalid')) {
        console.warn('Profile fetch failed due to CSRF token issue - will retry on next request');
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check WorkOS authentication with credentials to include cookies
      const response = await fetch('/api/auth/workos/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      // Extract CSRF token from response headers
      const token = response.headers.get('X-CSRF-Token');
      if (token) {
        setCSRFToken(token);
      }
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Fetch user profile from database
        const userProfile = await fetchUserProfile(userData.id);
        setProfile(userProfile);

        // Update session info if available
        if (userData.sessionId) {
          setSessionInfo({
            sessionId: userData.sessionId,
            sessionVersion: userData.sessionVersion,
            deviceId: userData.deviceId,
            expiresAt: userData.expiresAt,
            lastActivity: userData.lastActivity,
          });
        }
      } else if (response.status === 401) {
        // 401 is expected for unauthenticated users, don't log as error
        setUser(null);
        setProfile(null);
        setSessionInfo(null);
        setCSRFToken(null);
      } else {
        // Only log actual server errors
        console.error('Unexpected auth status response:', response.status, response.statusText);
        setUser(null);
        setProfile(null);
        setSessionInfo(null);
        setCSRFToken(null);
      }
    } catch (error) {
      // Only log network errors, not authentication failures
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error checking auth status:', error);
        setError('Network error - please check your connection');
      } else {
        console.error('Failed to check auth status:', error);
        setError('Failed to load authentication status');
      }
      setUser(null);
      setProfile(null);
      setSessionInfo(null);
      setCSRFToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await fetchUserProfile(user.id);
        setProfile(userProfile);
        setError(null); // Clear any previous errors
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        console.error('Failed to refresh profile:', error);
      }
    }
  };

  // Security alert management
  const addSecurityAlert = useCallback((alert: Omit<SecurityAlert, 'id' | 'dismissed'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: Date.now().toString(),
      dismissed: false,
    };
    setSecurityAlerts(prev => [newAlert, ...prev]);
  }, []);

  const dismissSecurityAlert = useCallback((alertId: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  }, []);

  // Session invalidation functions
  const invalidateAllSessions = useCallback(async (excludeCurrent: boolean = true): Promise<boolean> => {
    try {
      const params = new URLSearchParams();
      if (excludeCurrent) {
        params.set('exclude_current', 'true');
        if (sessionInfo?.sessionId) {
          params.set('current_session_id', sessionInfo.sessionId);
        }
      }

      const response = await makeAuthenticatedRequest(`/api/auth/sessions?${params}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addSecurityAlert({
          type: 'session_invalidation',
          title: 'Sessions Invalidated',
          message: excludeCurrent 
            ? 'All other sessions have been logged out for security.' 
            : 'All sessions have been logged out.',
          severity: 'medium',
          timestamp: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to invalidate sessions:', error);
      return false;
    }
  }, [makeAuthenticatedRequest, sessionInfo, addSecurityAlert]);

  const invalidateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await makeAuthenticatedRequest('/api/auth/sessions/invalidate', {
        method: 'POST',
        body: JSON.stringify({
          sessionIds: [sessionId],
          reason: 'user_action',
        }),
      });

      if (response.ok) {
        addSecurityAlert({
          type: 'session_invalidation',
          title: 'Session Terminated',
          message: 'A session has been successfully terminated.',
          severity: 'low',
          timestamp: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      return false;
    }
  }, [makeAuthenticatedRequest, addSecurityAlert]);

  const signIn = () => {
    window.location.href = '/api/auth/workos/login';
  };

  const signOut = async () => {
    try {
      // Invalidate current session
      if (sessionInfo?.sessionId) {
        await invalidateSession(sessionInfo.sessionId);
      }

      // Revoke tokens before logout
      if (tokenRotationHook.canRotate) {
        await tokenRotationHook.revokeTokens();
      }
      
      // Clear CSRF token on logout
      setCSRFToken(null);
      
      // Clear user state
      setUser(null);
      setProfile(null);
      setSessionInfo(null);
      setSecurityAlerts([]);
      
      // Redirect to logout endpoint
      window.location.href = '/api/auth/workos/logout';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Continue with logout even if session invalidation fails
      setCSRFToken(null);
      setUser(null);
      setProfile(null);
      setSessionInfo(null);
      setSecurityAlerts([]);
      window.location.href = '/api/auth/workos/logout';
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Refresh CSRF token periodically (every 30 minutes)
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshCSRFToken, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, refreshCSRFToken]);

  // Monitor for security events and session invalidations
  useEffect(() => {
    if (user && sessionInfo?.sessionId) {
      const pollInterval = setInterval(async () => {
        try {
          // Check for pending invalidations
          const response = await makeAuthenticatedRequest('/api/auth/sessions/invalidate');
          if (response.ok) {
            const data = await response.json();
            
            // Handle pending invalidations
            if (data.pendingInvalidations?.length > 0) {
              data.pendingInvalidations.forEach((invalidation: any) => {
                if (invalidation.session_ids.includes(sessionInfo.sessionId)) {
                  addSecurityAlert({
                    type: 'session_invalidation',
                    title: 'Session Invalidation Scheduled',
                    message: invalidation.message,
                    severity: 'high',
                    timestamp: invalidation.scheduled_at,
                    actionRequired: true,
                    actions: [
                      {
                        label: 'Cancel',
                        type: 'secondary',
                        action: async () => {
                          try {
                            await makeAuthenticatedRequest('/api/auth/sessions/invalidate', {
                              method: 'PUT',
                              body: JSON.stringify({
                                invalidationId: invalidation.id,
                                action: 'cancel',
                              }),
                            });
                          } catch (error) {
                            console.error('Failed to cancel invalidation:', error);
                          }
                        }
                      },
                      {
                        label: 'Delay 5 min',
                        type: 'primary',
                        action: async () => {
                          try {
                            await makeAuthenticatedRequest('/api/auth/sessions/invalidate', {
                              method: 'PUT',
                              body: JSON.stringify({
                                invalidationId: invalidation.id,
                                action: 'delay',
                                delayMinutes: 5,
                              }),
                            });
                          } catch (error) {
                            console.error('Failed to delay invalidation:', error);
                          }
                        }
                      }
                    ]
                  });
                }
              });
            }
          }
        } catch (error) {
          console.warn('Failed to check for security events:', error);
        }
      }, 60000); // Check every minute

      return () => clearInterval(pollInterval);
    }
  }, [user, sessionInfo, makeAuthenticatedRequest, addSecurityAlert]);

  // Handle token rotation errors
  useEffect(() => {
    if (tokenRotationHook.hasError && tokenRotationHook.lastError) {
      console.warn('Token rotation error:', tokenRotationHook.lastError);
      
      // If it's a critical error that suggests compromise, clear user session
      const criticalErrors = [
        'Token family compromised',
        'Token family revoked',
        'Suspicious token usage detected'
      ];
      
      if (criticalErrors.some(error => tokenRotationHook.lastError?.includes(error))) {
        console.warn('Critical token error detected, clearing session');
        setUser(null);
        setProfile(null);
        setSessionInfo(null);
        setCSRFToken(null);
        setError('Session security compromised. Please sign in again.');
        
        addSecurityAlert({
          type: 'security_breach',
          title: 'Security Breach Detected',
          message: 'Your session has been terminated due to a security concern. Please log in again.',
          severity: 'critical',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Non-critical error, show warning but don't log out
        addSecurityAlert({
          type: 'suspicious_activity',
          title: 'Token Security Warning',
          message: tokenRotationHook.lastError,
          severity: 'medium',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, []); // Removed tokenRotationHook dependencies to prevent circular dependency

  // Token rotation interface for the context
  const tokenRotation = {
    isRotating: tokenRotationHook.isRotating,
    canRotate: tokenRotationHook.canRotate,
    hasError: tokenRotationHook.hasError,
    lastError: tokenRotationHook.lastError,
    forceRotation: tokenRotationHook.forceRotation,
    revokeTokens: tokenRotationHook.revokeTokens,
    getTokenExpiry: tokenRotationHook.getTokenExpiry,
  };

  const value: WorkOSAuthContextType = {
    user,
    profile,
    sessionInfo,
    securityAlerts: securityAlerts.filter(alert => !alert.dismissed),
    loading,
    profileLoading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || false,
    refreshProfile,
    dismissSecurityAlert,
    invalidateAllSessions,
    invalidateSession,
    csrfToken,
    refreshCSRFToken,
    makeAuthenticatedRequest,
    tokenRotation,
  };

  return (
    <WorkOSAuthContext.Provider value={value}>
      {children}
    </WorkOSAuthContext.Provider>
  );
}

export function useWorkOSAuth() {
  const context = useContext(WorkOSAuthContext);
  if (context === undefined) {
    throw new Error('useWorkOSAuth must be used within a WorkOSAuthProvider');
  }
  return context;
}