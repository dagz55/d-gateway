'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  label?: string;
  variant?: 'default' | 'dark' | 'high-quality';
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
  default: '/zignal-mix.png',
  dark: '/zignal-mix.png',
  'high-quality': '/zignal-mix.png',
};

export default function Logo({
  className,
  size = 'md',
  showText = false,
  textClassName,
  label = 'Zignal',
  variant = 'default',
}: LogoProps) {
  const { width, height } = sizeMap[size];
  const logoSrc = logoVariants[variant];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <Image 
          src={logoSrc}
          alt="Zignals Logo"
          width={width}
          height={height}
          className="object-contain"
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
}