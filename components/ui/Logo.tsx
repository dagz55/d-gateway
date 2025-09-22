'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

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
  default: '/zignal-logo.png',
  dark: '/zignal-logo.png',
  'high-quality': '/zignal-logo.png',
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
  const [isHovered, setIsHovered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const router = useRouter();
  const { navigateWithLoading } = useNavigationLoading();

  // Continuous signal effect when animations are enabled
  useEffect(() => {
    if (!enableAnimations) return;

    let timeoutId: NodeJS.Timeout;

    const triggerSignal = () => {
      if (!isAnimating) {
        setIsAnimating(true);
        timeoutId = setTimeout(() => setIsAnimating(false), 4000); // Longer signal duration
      }
    };

    // Start the interval - slower signal frequency
    const intervalId = setInterval(triggerSignal, 12000); // Trigger signal every 12 seconds

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [enableAnimations, isAnimating]);

  const handleClick = async (e?: React.MouseEvent) => {
    if (enableAnimations && asLink) {
      // Prevent default navigation if animations are enabled
      if (e) {
        e.preventDefault();
      }

      setIsAnimating(true);
      setIsFading(true);

      // Navigate with loading after fade animation completes
      setTimeout(async () => {
        setIsAnimating(false);
        setIsFading(false);
        if (href) {
          await navigateWithLoading(href, 'Returning home...');
        }
      }, 1500); // Fade duration
    }
  };

  const handleMouseEnter = () => {
    if (enableAnimations) {
      setIsHovered(true);
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    if (enableAnimations) {
      setIsHovered(false);
      setIsZoomed(false);
    }
  };

  const logoContent = (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative group">
        {/* Continuous signal rings when animations enabled */}
        {enableAnimations && (
          <>
            {/* Outer ring - continuous subtle pulse - wider and more subtle */}
            <div className="absolute -inset-2 rounded-full border border-[#33E1DA] opacity-10 motion-safe:animate-pulse motion-reduce:opacity-20"></div>
            
            {/* Active signal rings - only show when animating - wider and slower */}
            {isAnimating && (
              <>
                <div className="absolute -inset-4 motion-safe:animate-ping motion-reduce:opacity-40" style={{ animationDuration: '3s' }}>
                  <div className="w-full h-full rounded-full border-2 border-[#33E1DA] opacity-60"></div>
                </div>
                <div className="absolute -inset-6 motion-safe:animate-ping motion-reduce:opacity-25" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                  <div className="w-full h-full rounded-full border-2 border-[#0577DA] opacity-40"></div>
                </div>
                <div className="absolute -inset-8 motion-safe:animate-ping motion-reduce:opacity-15" style={{ animationDelay: '1s', animationDuration: '3s' }}>
                  <div className="w-full h-full rounded-full border-2 border-[#1199FA] opacity-20"></div>
                </div>
                <div className="absolute -inset-10 motion-safe:animate-ping motion-reduce:opacity-10" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
                  <div className="w-full h-full rounded-full border border-[#33E1DA] opacity-10"></div>
                </div>
              </>
            )}

            {/* Glow effect - wider */}
            <div className={cn(
              "absolute -inset-2 rounded-full motion-safe:transition-all motion-safe:duration-500 motion-reduce:transition-none",
              isHovered ? "shadow-[0_0_25px_rgba(51,225,218,0.5)]" : "shadow-[0_0_15px_rgba(51,225,218,0.3)]",
              isAnimating && "shadow-[0_0_35px_rgba(51,225,218,0.7)]"
            )}></div>
          </>
        )}

        <Image
          src={logoSrc}
          alt="Zignal Logo"
          width={width}
          height={height}
          className={cn(
            "object-contain transition-all duration-500 relative z-10",
            enableAnimations && [
              "drop-shadow-md",
              // Respect user's motion preferences
              "motion-safe:transition-all",
              "motion-reduce:transition-none"
            ],
            // Zoom effects - only when hovered, no fade during zoom - more noticeable
            isZoomed && [
              "scale-150",
              "brightness-125",
              "drop-shadow-2xl"
            ],
            // Signal animation effects
            isAnimating && [
              "animate-pulse",
              "brightness-110",
              "scale-105",
              "motion-safe:animate-pulse",
              "motion-reduce:animate-none"
            ],
            // Fade effects - only when not zoomed and fading
            isFading && !isZoomed && [
              "opacity-30",
              "scale-95",
              "blur-sm",
              "motion-safe:transition-all",
              "motion-reduce:transition-none"
            ]
          )}
          priority={size === 'lg' || size === 'xl'}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      {showText && (
        <h2 className={cn(
          "font-semibold transition-all duration-300",
          textSizeClasses[size],
          textClassName ?? "text-foreground",
          enableAnimations && isHovered && "text-[#33E1DA]",
          // Only fade text when not zoomed and fading
          isFading && !isZoomed && "opacity-30"
        )}>
          {label}
        </h2>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={enableAnimations ? "#" : href}
        className={cn(
          "cursor-pointer transition-all duration-300 block",
          enableAnimations ? "" : "hover:opacity-80", // Remove scale from link container
          isFading && "pointer-events-none"
        )}
        title="Go to home"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <div 
      onClick={handleClick} 
      className={cn(
        enableAnimations ? "cursor-pointer" : "",
        isFading && "pointer-events-none"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {logoContent}
    </div>
  );
}