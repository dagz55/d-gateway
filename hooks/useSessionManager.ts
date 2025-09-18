import { useState, useEffect, useCallback } from 'react';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';

export interface SessionData {
  sessionId: string;
  userId: string;
  sessionVersion: number;
  deviceId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  permissions?: string[];
  device?: DeviceData;
}

export interface DeviceData {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'smart_tv' | 'game_console' | 'unknown';
  operatingSystem: string;
  browser: string;
  isTrusted: boolean;
  isActive: boolean;
  firstSeen: string;
  lastSeen: string;
  lastIP: string;
  sessions?: SessionData[];
  activeSessionCount?: number;
}

export interface InvalidationEvent {
  userId: string;
  reason: string;
  affectedSessions: string[];
  triggeredBy: string;
  timestamp: string;
}

export interface PendingInvalidation {
  id: string;
  sessionIds: string[];
  trigger: string;
  message: string;
  executeAt: string;
  warningTimeMinutes: number;
  allowExtension: boolean;
}

export interface SessionManagerState {
  sessions: SessionData[];
  devices: DeviceData[];
  currentSession: SessionData | null;
  pendingInvalidations: PendingInvalidation[];
  invalidationHistory: InvalidationEvent[];
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export interface SessionManagerActions {
  refreshSessions: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  invalidateSession: (sessionId: string) => Promise<boolean>;
  invalidateAllSessions: (excludeCurrent?: boolean) => Promise<boolean>;
  invalidateDeviceSessions: (deviceId: string) => Promise<boolean>;
  trustDevice: (deviceId: string) => Promise<boolean>;
  revokeTrust: (deviceId: string) => Promise<boolean>;
  verifyDevice: (deviceId: string, verificationCode: string) => Promise<boolean>;
  removeDevice: (deviceId: string) => Promise<boolean>;
  cancelInvalidation: (invalidationId: string) => Promise<boolean>;
  delayInvalidation: (invalidationId: string, delayMinutes: number) => Promise<boolean>;
  executeInvalidationNow: (invalidationId: string) => Promise<boolean>;
  updateSessionActivity: () => Promise<void>;
}

export interface UseSessionManagerOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeDevices?: boolean;
  includeInactive?: boolean;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
}

const DEFAULT_OPTIONS: UseSessionManagerOptions = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  includeDevices: true,
  includeInactive: false,
  enableHeartbeat: true,
  heartbeatInterval: 60000, // 1 minute
};

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { makeAuthenticatedRequest, isAuthenticated, user } = useWorkOSAuth();

  const [state, setState] = useState<SessionManagerState>({
    sessions: [],
    devices: [],
    currentSession: null,
    pendingInvalidations: [],
    invalidationHistory: [],
    loading: false,
    error: null,
    lastUpdate: null,
  });

  // Helper function to make authenticated API calls
  const makeApiCall = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    const response = await makeAuthenticatedRequest(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }, [makeAuthenticatedRequest, isAuthenticated]);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        include_devices: opts.includeDevices ? 'true' : 'false',
        include_inactive: opts.includeInactive ? 'true' : 'false',
      });

      const data = await makeApiCall(`/api/auth/sessions?${params}`);
      
      setState(prev => ({
        ...prev,
        sessions: data.sessions || [],
        currentSession: data.sessions?.find((s: SessionData) => s.isActive) || null,
        lastUpdate: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh sessions',
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [makeApiCall, isAuthenticated, opts.includeDevices, opts.includeInactive]);

  // Refresh devices
  const refreshDevices = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const params = new URLSearchParams({
        include_sessions: 'true',
        include_inactive: opts.includeInactive ? 'true' : 'false',
      });

      const data = await makeApiCall(`/api/auth/sessions/devices?${params}`);
      
      setState(prev => ({
        ...prev,
        devices: data.devices || [],
        lastUpdate: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to refresh devices:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh devices',
      }));
    }
  }, [makeApiCall, isAuthenticated, opts.includeInactive]);

  // Refresh pending invalidations
  const refreshInvalidations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await makeApiCall('/api/auth/sessions/invalidate?include_history=true');
      
      setState(prev => ({
        ...prev,
        pendingInvalidations: data.pendingInvalidations || [],
        invalidationHistory: data.invalidationHistory || [],
      }));
    } catch (error) {
      console.error('Failed to refresh invalidations:', error);
    }
  }, [makeApiCall, isAuthenticated]);

  // Invalidate specific session
  const invalidateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/invalidate', {
        method: 'POST',
        body: JSON.stringify({
          sessionIds: [sessionId],
          reason: 'user_logout',
        }),
      });

      // Refresh sessions after invalidation
      await refreshSessions();
      return true;
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invalidate session',
      }));
      return false;
    }
  }, [makeApiCall, refreshSessions]);

  // Invalidate all sessions
  const invalidateAllSessions = useCallback(async (excludeCurrent: boolean = true): Promise<boolean> => {
    try {
      const params = new URLSearchParams();
      if (excludeCurrent) {
        params.set('exclude_current', 'true');
        if (state.currentSession) {
          params.set('current_session_id', state.currentSession.sessionId);
        }
      }

      await makeApiCall(`/api/auth/sessions?${params}`, {
        method: 'DELETE',
      });

      // Refresh sessions after invalidation
      await refreshSessions();
      return true;
    } catch (error) {
      console.error('Failed to invalidate all sessions:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invalidate sessions',
      }));
      return false;
    }
  }, [makeApiCall, refreshSessions, state.currentSession]);

  // Invalidate device sessions
  const invalidateDeviceSessions = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const deviceSessions = state.sessions.filter(s => s.deviceId === deviceId && s.isActive);
      
      if (deviceSessions.length === 0) {
        return true; // No sessions to invalidate
      }

      await makeApiCall('/api/auth/sessions/invalidate', {
        method: 'POST',
        body: JSON.stringify({
          sessionIds: deviceSessions.map(s => s.sessionId),
          reason: 'device_change',
        }),
      });

      // Refresh sessions after invalidation
      await refreshSessions();
      return true;
    } catch (error) {
      console.error('Failed to invalidate device sessions:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invalidate device sessions',
      }));
      return false;
    }
  }, [makeApiCall, refreshSessions, state.sessions]);

  // Trust device
  const trustDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/devices', {
        method: 'PUT',
        body: JSON.stringify({
          deviceId,
          action: 'trust',
        }),
      });

      // Refresh devices after trust change
      await refreshDevices();
      return true;
    } catch (error) {
      console.error('Failed to trust device:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to trust device',
      }));
      return false;
    }
  }, [makeApiCall, refreshDevices]);

  // Revoke trust
  const revokeTrust = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/devices', {
        method: 'PUT',
        body: JSON.stringify({
          deviceId,
          action: 'revoke_trust',
        }),
      });

      // Refresh devices after trust change
      await refreshDevices();
      return true;
    } catch (error) {
      console.error('Failed to revoke trust:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to revoke trust',
      }));
      return false;
    }
  }, [makeApiCall, refreshDevices]);

  // Verify device
  const verifyDevice = useCallback(async (deviceId: string, verificationCode: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/devices', {
        method: 'PUT',
        body: JSON.stringify({
          deviceId,
          action: 'verify',
          verificationCode,
        }),
      });

      // Refresh devices after verification
      await refreshDevices();
      return true;
    } catch (error) {
      console.error('Failed to verify device:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to verify device',
      }));
      return false;
    }
  }, [makeApiCall, refreshDevices]);

  // Remove device
  const removeDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        device_id: deviceId,
        invalidate_sessions: 'true',
      });

      await makeApiCall(`/api/auth/sessions/devices?${params}`, {
        method: 'DELETE',
      });

      // Refresh both devices and sessions after removal
      await Promise.all([refreshDevices(), refreshSessions()]);
      return true;
    } catch (error) {
      console.error('Failed to remove device:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove device',
      }));
      return false;
    }
  }, [makeApiCall, refreshDevices, refreshSessions]);

  // Cancel invalidation
  const cancelInvalidation = useCallback(async (invalidationId: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/invalidate', {
        method: 'PUT',
        body: JSON.stringify({
          invalidationId,
          action: 'cancel',
        }),
      });

      // Refresh invalidations after cancellation
      await refreshInvalidations();
      return true;
    } catch (error) {
      console.error('Failed to cancel invalidation:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel invalidation',
      }));
      return false;
    }
  }, [makeApiCall, refreshInvalidations]);

  // Delay invalidation
  const delayInvalidation = useCallback(async (
    invalidationId: string,
    delayMinutes: number
  ): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/invalidate', {
        method: 'PUT',
        body: JSON.stringify({
          invalidationId,
          action: 'delay',
          delayMinutes,
        }),
      });

      // Refresh invalidations after delay
      await refreshInvalidations();
      return true;
    } catch (error) {
      console.error('Failed to delay invalidation:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delay invalidation',
      }));
      return false;
    }
  }, [makeApiCall, refreshInvalidations]);

  // Execute invalidation now
  const executeInvalidationNow = useCallback(async (invalidationId: string): Promise<boolean> => {
    try {
      await makeApiCall('/api/auth/sessions/invalidate', {
        method: 'PUT',
        body: JSON.stringify({
          invalidationId,
          action: 'execute_now',
        }),
      });

      // Refresh both sessions and invalidations after execution
      await Promise.all([refreshSessions(), refreshInvalidations()]);
      return true;
    } catch (error) {
      console.error('Failed to execute invalidation:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute invalidation',
      }));
      return false;
    }
  }, [makeApiCall, refreshSessions, refreshInvalidations]);

  // Update session activity (heartbeat)
  const updateSessionActivity = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      await makeApiCall('/api/auth/sessions', {
        method: 'PUT',
        body: JSON.stringify({
          sessionId: state.currentSession.sessionId,
        }),
      });
    } catch (error) {
      console.warn('Failed to update session activity:', error);
      // Don't update error state for heartbeat failures
    }
  }, [makeApiCall, state.currentSession]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAuthenticated || !opts.autoRefresh) return;

    const interval = setInterval(() => {
      refreshSessions();
      if (opts.includeDevices) {
        refreshDevices();
      }
      refreshInvalidations();
    }, opts.refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, opts.autoRefresh, opts.refreshInterval, opts.includeDevices, refreshSessions, refreshDevices, refreshInvalidations]);

  // Heartbeat effect
  useEffect(() => {
    if (!isAuthenticated || !opts.enableHeartbeat) return;

    const interval = setInterval(updateSessionActivity, opts.heartbeatInterval);
    return () => clearInterval(interval);
  }, [isAuthenticated, opts.enableHeartbeat, opts.heartbeatInterval, updateSessionActivity]);

  // Initial load effect
  useEffect(() => {
    if (isAuthenticated) {
      refreshSessions();
      if (opts.includeDevices) {
        refreshDevices();
      }
      refreshInvalidations();
    }
  }, [isAuthenticated, opts.includeDevices, refreshSessions, refreshDevices, refreshInvalidations]);

  // Clear state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setState({
        sessions: [],
        devices: [],
        currentSession: null,
        pendingInvalidations: [],
        invalidationHistory: [],
        loading: false,
        error: null,
        lastUpdate: null,
      });
    }
  }, [isAuthenticated]);

  const actions: SessionManagerActions = {
    refreshSessions,
    refreshDevices,
    invalidateSession,
    invalidateAllSessions,
    invalidateDeviceSessions,
    trustDevice,
    revokeTrust,
    verifyDevice,
    removeDevice,
    cancelInvalidation,
    delayInvalidation,
    executeInvalidationNow,
    updateSessionActivity,
  };

  return {
    ...state,
    ...actions,
    isAuthenticated,
    user,
  };
}