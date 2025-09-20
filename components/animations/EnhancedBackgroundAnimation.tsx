'use client';

import { CryptoBackgroundAnimation } from './CryptoBackgroundAnimation';
import { TechBackgroundAnimation } from './TechBackgroundAnimation';

interface EnhancedBackgroundAnimationProps {
  variant?: 'crypto' | 'tech' | 'combined';
  intensity?: 'low' | 'medium' | 'high';
}

export function EnhancedBackgroundAnimation({ 
  variant = 'combined', 
  intensity = 'medium' 
}: EnhancedBackgroundAnimationProps) {
  const opacityClass = {
    low: 'opacity-30',
    medium: 'opacity-50',
    high: 'opacity-70',
  }[intensity];

  return (
    <div className={`absolute inset-0 ${opacityClass}`}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
      
      {/* Animated layers based on variant */}
      {(variant === 'crypto' || variant === 'combined') && (
        <div className="absolute inset-0">
          <CryptoBackgroundAnimation />
        </div>
      )}
      
      {(variant === 'tech' || variant === 'combined') && (
        <div className="absolute inset-0">
          <TechBackgroundAnimation />
        </div>
      )}
      
      {/* Overlay effects */}
      <div className="absolute inset-0">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />
        
        {/* Animated glow spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-crypto-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-crypto-glow-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl animate-crypto-pulse" />
      </div>
    </div>
  );
}