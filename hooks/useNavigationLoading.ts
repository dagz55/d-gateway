'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export function useNavigationLoading() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const navigateWithLoading = useCallback(async (
    href: string, 
    loadingText: string = 'Navigating...'
  ) => {
    showLoading(loadingText);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Navigate
    router.push(href);
    
    // Hide loading after navigation
    setTimeout(() => {
      hideLoading();
    }, 1000);
  }, [router, showLoading, hideLoading]);

  return {
    navigateWithLoading
  };
}
