'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import GlobalLoadingOverlay from '@/components/ui/GlobalLoadingOverlay';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (isLoading: boolean, loadingText?: string) => void;
  showLoading: (loadingText?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const setLoading = (loading: boolean, text: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  const showLoading = (text: string = 'Loading...') => {
    setIsLoading(true);
    setLoadingText(text);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingText('Loading...');
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingText,
      setLoading,
      showLoading,
      hideLoading
    }}>
      {children}
      <GlobalLoadingOverlay isLoading={isLoading} loadingText={loadingText} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
