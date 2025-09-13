'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    // Fallback to Supabase URL if local image fails
    if (img.src.includes('/zignal_logo.png')) {
      img.src = 'https://nmockaibjbavenndxexd.supabase.co/storage/v1/object/public/image/zignal_logo.png';
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <img 
          src="/zignal_logo.png"
          alt="Zignal Logo"
          className={cn("object-contain", sizeClasses[size])}
          onError={handleImageError}
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