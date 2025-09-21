'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Image from 'next/image';
import { LandingContent } from './LandingContent';

// Lazy load heavy components for better performance
const AnimatedBackground = dynamic(() => import('./AnimatedBackground').then(mod => ({ default: mod.AnimatedBackground })), {
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
      {/* Optimized background image with Next.js Image */}
      <div className="absolute inset-0">
        <Image
          src="/zignals_login_wallpaper.png"
          alt="Zignal Trading Background"
          fill
          className="object-cover object-center"
          style={{
            mixBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}
          priority
          sizes="100vw"
          quality={85}
        />
      </div>

      {/* Interactive ripple background */}
      <Suspense fallback={<div className="absolute inset-0" />}>
        <div className="absolute inset-0 opacity-60">
          <BackgroundCells />
        </div>
      </Suspense>

      {/* Animated background particles */}
      <Suspense fallback={<div className="absolute inset-0" />}>
        <AnimatedBackground />
      </Suspense>

      {/* Main content */}
      <div className="relative z-50">
        <LandingContent />
      </div>
    </div>
  );
}