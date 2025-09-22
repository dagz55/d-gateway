'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: 'text-sm' },
  md: { width: 48, height: 48, textSize: 'text-base' },
  lg: { width: 64, height: 64, textSize: 'text-lg' },
  xl: { width: 80, height: 80, textSize: 'text-xl' }
};

export default function LoadingSpinner({
  size = 'md',
  className,
  showText = true,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const { width, height, textSize } = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Spinner Container */}
      <div className="relative">
        {/* Signal rings - animated */}
        <div className="absolute inset-0 animate-ping">
          <div className="w-full h-full rounded-full border-2 border-[#33E1DA] opacity-75"></div>
        </div>
        <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.2s' }}>
          <div className="w-full h-full rounded-full border-2 border-[#0577DA] opacity-50"></div>
        </div>
        <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.4s' }}>
          <div className="w-full h-full rounded-full border-2 border-[#1199FA] opacity-25"></div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full animate-pulse">
          <div className="w-full h-full rounded-full shadow-[0_0_20px_rgba(51,225,218,0.4)]"></div>
        </div>

        {/* Logo - rotating */}
        <div className="relative z-10 animate-spin" style={{ animationDuration: '2s' }}>
          <Image
            src="/zignal-logo.png"
            alt="Zignal Logo"
            width={width}
            height={height}
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Inner pulse ring */}
        <div className="absolute inset-2 rounded-full border border-[#33E1DA] opacity-30 animate-pulse"></div>
      </div>

      {/* Loading text */}
      {showText && (
        <div className={cn("text-[#33E1DA] font-medium animate-pulse", textSize)}>
          {text}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[#0577DA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[#1199FA] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
