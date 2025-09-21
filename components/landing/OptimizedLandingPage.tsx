"use client";

import { memo, Suspense, lazy, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LandingContent } from './LandingContent';

// Lazy load optimized background component
const OptimizedWallpaperBackground = lazy(() => 
  import('./OptimizedWallpaperBackground').then(mod => ({ 
    default: mod.OptimizedWallpaperBackground 
  }))
);

const BackgroundCells = lazy(() => 
  import('@/components/blocks/background-ripple-effect').then(mod => ({ 
    default: mod.BackgroundCells 
  }))
);

// Optimized fallback components
const BackgroundFallback = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-[#040918] via-[#071635] to-[#02040B]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,153,250,0.3)_0%,transparent_60%)] opacity-50" />
  </div>
));

const RippleFallback = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#33E1DA]/5 to-transparent" />
));

// Performance-optimized landing page
export const OptimizedLandingPage = memo(() => {
  // Intersection observer for lazy loading heavy animations
  const { ref: backgroundRef, isIntersecting: backgroundVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const { ref: rippleRef, isIntersecting: rippleVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Memoized background component
  const BackgroundComponent = useMemo(() => (
    <div ref={backgroundRef} className="absolute inset-0">
      {backgroundVisible ? (
        <Suspense fallback={<BackgroundFallback />}>
          <OptimizedWallpaperBackground 
            quality={75}
            enableParallax={true}
            enableMouseTracking={true}
          />
        </Suspense>
      ) : (
        <BackgroundFallback />
      )}
    </div>
  ), [backgroundVisible]);

  // Memoized ripple component
  const RippleComponent = useMemo(() => (
    <div ref={rippleRef} className="absolute inset-0 opacity-40 z-10">
      {rippleVisible ? (
        <Suspense fallback={<RippleFallback />}>
          <BackgroundCells />
        </Suspense>
      ) : (
        <RippleFallback />
      )}
    </div>
  ), [rippleVisible]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Optimized background with intersection observer */}
      {BackgroundComponent}

      {/* Optimized ripple effect with intersection observer */}
      {RippleComponent}

      {/* Main content with higher z-index */}
      <div className="relative z-50">
        <LandingContent />
      </div>
    </div>
  );
});

OptimizedLandingPage.displayName = 'OptimizedLandingPage';
