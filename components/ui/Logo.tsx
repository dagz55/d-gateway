'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  label?: string;
  variant?: 'default' | 'dark' | 'high-quality';
  asLink?: boolean;
  href?: string;
  enableAnimations?: boolean;
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

const logoVariants = {
  default: '/logo-zgnls.png',
  dark: '/logo-zgnls.png',
  'high-quality': '/logo-zgnls.png',
};

export default function Logo({
  className,
  size = 'md',
  showText = false,
  textClassName,
  label = 'Zignal',
  variant = 'default',
  asLink = true,
  href = '/',
  enableAnimations = false,
}: LogoProps) {
  const { width, height } = sizeMap[size];
  const logoSrc = logoVariants[variant];
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (enableAnimations) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000); // Animation duration
    }
  };

  const logoContent = (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        {/* Radar signal rings - only show when animating */}
        {enableAnimations && isAnimating && (
          <>
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full border-2 border-[#33E1DA] opacity-75"></div>
            </div>
            <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.2s' }}>
              <div className="w-full h-full rounded-full border-2 border-[#0577DA] opacity-50"></div>
            </div>
            <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.4s' }}>
              <div className="w-full h-full rounded-full border-2 border-[#1199FA] opacity-25"></div>
            </div>
          </>
        )}

        <Image
          src={logoSrc}
          alt="Zignals Logo"
          width={width}
          height={height}
          className={cn(
            "object-contain transition-transform duration-300",
            enableAnimations && "hover:scale-110",
            isAnimating && "animate-pulse"
          )}
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
      {showText && (
        <h2 className={cn(
          "font-semibold",
          textSizeClasses[size],
          textClassName ?? "text-foreground"
        )}>
          {label}
        </h2>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className={cn(
          "cursor-pointer transition-all duration-300",
          enableAnimations ? "hover:scale-105" : "hover:opacity-80"
        )}
        title="Go to home"
        onClick={handleClick}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className={enableAnimations ? "cursor-pointer" : ""}>
      {logoContent}
    </div>
  );
}