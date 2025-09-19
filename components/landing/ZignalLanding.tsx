'use client';

import { AnimatedBackground } from './AnimatedBackground';
import { LandingContent } from './LandingContent';
import { ANIMATION_CONFIG } from '@/lib/constants/animation-config';

export function ZignalLanding() {
  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        background: `linear-gradient(to bottom right, ${ANIMATION_CONFIG.COLORS.BACKGROUND_START}, ${ANIMATION_CONFIG.COLORS.BACKGROUND_MID}, ${ANIMATION_CONFIG.COLORS.BACKGROUND_END})`
      }}
    >
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Main content */}
      <LandingContent />
    </div>
  );
}