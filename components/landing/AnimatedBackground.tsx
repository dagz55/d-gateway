'use client';

import { useEffect, useState } from 'react';
import { ANIMATION_CONFIG, getAnimationValues } from '@/lib/constants/animation-config';

export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("${ANIMATION_CONFIG.TRADING_GRID_PATTERN}")`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated crypto symbols */}
      <div className="absolute inset-0">
        {Array.from({ length: ANIMATION_CONFIG.GRID_COLUMNS * ANIMATION_CONFIG.GRID_ROWS }).map((_, index) => {
          const values = getAnimationValues(index, isClient);
          const x = (index % ANIMATION_CONFIG.GRID_COLUMNS) * (100 / ANIMATION_CONFIG.GRID_COLUMNS);
          const symbol = ANIMATION_CONFIG.CRYPTO_SYMBOLS[index % ANIMATION_CONFIG.CRYPTO_SYMBOLS.length];
          const priceChange = ANIMATION_CONFIG.PRICE_CHANGES[index % ANIMATION_CONFIG.PRICE_CHANGES.length];
          
          return (
            <div
              key={index}
              className="absolute text-2xl font-bold opacity-20 select-none pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${values.baseY}px`,
                color: values.isGreen ? ANIMATION_CONFIG.COLORS.GREEN : ANIMATION_CONFIG.COLORS.RED,
                animationDelay: values.animationDelay,
                animationDuration: values.animationDuration,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
                animationName: 'float'
              }}
            >
              <div className="flex flex-col items-center">
                <span>{symbol}</span>
                <span className="text-xs">{priceChange}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* CSS Animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-40px) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-20px) rotate(270deg);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0px) rotate(360deg);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
