'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPassword, signOut as signOutAction } from '@/lib/actions';

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

interface AuthContextType {
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  signInWithWorkOS: () => void;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const fetchUserProfile = async (workosUserId: string): Promise<UserProfile | null> => {
    try {
      setProfileLoading(true);
      const response = await fetch(`/api/auth/workos/profile?workos_user_id=${workosUserId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const profileData = await response.json();
        return profileData;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use WorkOS authentication only
      const workosResponse = await fetch('/api/auth/workos/callback', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (workosResponse.ok) {
        const user = await workosResponse.json();
        setUser(user);
        
        // If WorkOS auth is successful, try to get the profile
        if (user?.id) {
          const userProfile = await fetchUserProfile(user.id);
          setProfile(userProfile);
        }
      } else if (workosResponse.status === 401) {
        // 401 is expected when user is not authenticated - this is normal, not an error
        setUser(null);
        setProfile(null);
        setError(null); // Clear any previous errors
        return; // Don't treat this as an error
      } else {
        // Other HTTP errors (500, 403, etc.) are actual errors
        throw new Error(`Authentication check failed with status: ${workosResponse.status}`);
      }
    } catch (error) {
      // Import and use security logger for proper logging
      const { logAuthEvent } = await import('@/lib/security-logger');
      
      // Distinguish between different error types
      let userMessage = 'Failed to load authentication status';
      let errorDetails = '';
      
      if (error instanceof Error) {
        // Check for network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          userMessage = 'Network connection failed. Please check your internet connection.';
          errorDetails = 'Network/fetch error';
        } 
        // Check for authentication errors (401/invalid token)
        else if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('invalid token')) {
          userMessage = 'Authentication session expired. Please sign in again.';
          errorDetails = 'Authentication error (401/invalid token)';
        }
        // Check for timeout errors
        else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          userMessage = 'Request timed out. Please try again.';
          errorDetails = 'Timeout error';
        }
        else {
          errorDetails = error.message;
        }
      } else {
        errorDetails = String(error);
      }

      // Log the error with security logger including full context
      await logAuthEvent('auth_login_failure', {
        message: `Authentication check failed: ${errorDetails}`,
        details: `Full error: ${JSON.stringify(error)}, User Agent: ${navigator?.userAgent || 'unknown'}`,
        metadata: {
          errorType: errorDetails,
          timestamp: new Date().toISOString(),
          userAgent: navigator?.userAgent || 'unknown',
        }
      });

      setError(userMessage);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  const signInWithWorkOS = () => {
    window.location.href = '/api/auth/workos/login';
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithPassword(email, password);
    if (result.success) {
      await checkAuthStatus();
    }
    return result;
  };

  const signOut = async () => {
    await signOutAction();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    profileLoading,
    error,
    signInWithWorkOS,
    signInWithEmail,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || false,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
