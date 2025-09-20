'use client';

import { AnimatedBackground } from './AnimatedBackground';
import { LandingContent } from './LandingContent';
import { BackgroundCells } from '@/components/blocks/background-ripple-effect';
import { ANIMATION_CONFIG } from '@/lib/constants/animation-config';

export function ZignalLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/zignals_login_wallpaper.png)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      />

      {/* Interactive ripple background */}
      <div className="absolute inset-0 opacity-60">
        <BackgroundCells />
      </div>

      {/* Animated background particles */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-50">
        <LandingContent />
      </div>
    </div>
  );
}