'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 }, 
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 }
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl', 
  xl: 'text-2xl'
};

export default function Logo({ 
  className, 
  size = 'md', 
  showText = true, 
  textClassName 
}: LogoProps) {
  const { width, height } = sizeMap[size];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <Image 
          src="/zignal_logo.png"
          alt="Zignal Logo"
          width={width}
          height={height}
          className="object-contain"
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
      {showText && (
        <h2 className={cn(
          "font-semibold text-foreground",
          textSizeClasses[size],
          textClassName
        )}>
          Zignal
        </h2>
      )}
    </div>
  );
}