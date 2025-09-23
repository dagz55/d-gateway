'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// Throttle function for performance optimization
const throttle = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  let lastExecTime = 0;
  
  return function (...args: any[]) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

interface OptimizedWallpaperBackgroundProps {
  quality?: number;
  enableParallax?: boolean;
  enableMouseTracking?: boolean;
}

export const OptimizedWallpaperBackground = memo(({
  quality = 75,
  enableParallax = true,
  enableMouseTracking = true
}: OptimizedWallpaperBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Conditional parallax transforms (disabled for reduced motion)
  const backgroundY = useTransform(
    scrollY, 
    [0, 1000], 
    prefersReducedMotion || !enableParallax ? [0, 0] : [0, -200]
  );
  const overlayY = useTransform(
    scrollY, 
    [0, 1000], 
    prefersReducedMotion || !enableParallax ? [0, 0] : [0, -100]
  );

  // Optimized spring animations with reduced stiffness for better performance
  const springBackgroundY = useSpring(backgroundY, { 
    stiffness: prefersReducedMotion ? 0 : 50, 
    damping: 30,
    restDelta: 0.001
  });
  const springOverlayY = useSpring(overlayY, { 
    stiffness: prefersReducedMotion ? 0 : 50, 
    damping: 30,
    restDelta: 0.001
  });

  // Throttled mouse tracking for better performance
  const throttledMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (!enableMouseTracking || prefersReducedMotion) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 10, // Reduced intensity
        y: (clientY / innerHeight - 0.5) * 10,
      });
    }, 16), // ~60fps throttling
    [enableMouseTracking, prefersReducedMotion]
  );

  useEffect(() => {
    if (!enableMouseTracking || prefersReducedMotion) return;

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [throttledMouseMove, enableMouseTracking, prefersReducedMotion]);

  // Preload image for better performance
  useEffect(() => {
    const img = new window.Image();
    img.src = '/login_background_wallpaper_zignals04.png';
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      // Background image failed to preload - continuing without console warning
      setIsLoaded(true); // Still show component even if image fails
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Main Wallpaper Background */}
      <motion.div
        className="absolute inset-0 scale-105" // Reduced scale for better performance
        style={{ y: springBackgroundY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/login_background_wallpaper_zignals04.png"
          alt="Zignal Trading Background"
          fill
          className="object-cover object-center"
          style={{
            transform: enableMouseTracking && !prefersReducedMotion 
              ? `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)` 
              : 'none',
            transition: prefersReducedMotion ? 'none' : 'transform 0.3s ease-out',
            willChange: enableMouseTracking && !prefersReducedMotion ? 'transform' : 'auto',
          }}
          priority
          sizes="100vw"
          quality={quality}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // Silently handle load failure
        />
      </motion.div>

      {/* Optimized Overlay Gradients */}
      <motion.div
        className="absolute inset-0"
        style={{ y: springOverlayY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#040918]/90 via-[#071635]/80 to-[#02040B]/95" />

        {/* Dynamic color overlays - simplified for performance */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#33E1DA]/15 via-transparent to-[#1199FA]/15 opacity-50"
            style={{
              transform: enableMouseTracking 
                ? `translate3d(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px, 0)` 
                : 'none',
              transition: 'transform 0.5s ease-out',
            }}
          />
        )}

        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,225,218,0.1)_0%,transparent_70%)]" />
      </motion.div>

      {/* Performance indicator in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 text-xs text-white/50 bg-black/20 px-2 py-1 rounded">
          {prefersReducedMotion ? '🐌 Reduced Motion' : '⚡ Full Animation'}
        </div>
      )}
    </div>
  );
});

OptimizedWallpaperBackground.displayName = 'OptimizedWallpaperBackground';
