'use client';

import { AnimatedBackground } from './AnimatedBackground';
import { LandingContent } from './LandingContent';
import { ANIMATION_CONFIG } from '@/lib/constants/animation-config';

export function ZignalLanding() {
  return (
    <div
      className="min-h-screen flex flex-col relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/login_background_wallpaper_zignals04.png)',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Main content */}
      <LandingContent />
    </div>
  );
}