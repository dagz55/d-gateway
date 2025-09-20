'use client';

import { EnhancedBackgroundAnimation } from '@/components/animations/EnhancedBackgroundAnimation';
import { PriceTickerAnimation } from '@/components/animations/PriceTickerAnimation';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Enhanced background animations with crypto and tech elements */}
      <EnhancedBackgroundAnimation variant="combined" intensity="medium" />
      
      {/* Live price ticker */}
      <PriceTickerAnimation />
    </div>
  );
}