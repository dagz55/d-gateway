'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Image from 'next/image';
import { LandingContent } from './LandingContent';

// Lazy load heavy components for better performance
const EnhancedWallpaperBackground = dynamic(() => import('./EnhancedWallpaperBackground').then(mod => ({ default: mod.EnhancedWallpaperBackground })), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
});

const BackgroundCells = dynamic(() => import('@/components/blocks/background-ripple-effect').then(mod => ({ default: mod.BackgroundCells })), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
});

export function ZignalLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Enhanced wallpaper background with animations */}
      <Suspense fallback={<div className="absolute inset-0 bg-[#040918]" />}>
        <EnhancedWallpaperBackground />
      </Suspense>

      {/* Interactive ripple background overlay */}
      <Suspense fallback={<div className="absolute inset-0" />}>
        <div className="absolute inset-0 opacity-40 z-10">
          <BackgroundCells />
        </div>
      </Suspense>

      {/* Main content */}
      <div className="relative z-50">
        <LandingContent />
      </div>
    </div>
  );
}