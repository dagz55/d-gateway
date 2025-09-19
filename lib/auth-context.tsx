'use client';

import { createContext, useContext, ReactNode } from 'react';
import { UserResource } from '@clerk/types';

interface AuthContextType {
  userId?: string;
  user?: UserResource | null;
}

const AuthContext = createContext<AuthContextType>({});

interface AuthProviderProps {
  children: ReactNode;
  userId?: string;
  user?: UserResource | null;
}

export function AuthProvider({ children, userId, user }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ userId, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
