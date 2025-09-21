'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export function EnhancedWallpaperBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Parallax transforms
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200]);
  const overlayY = useTransform(scrollY, [0, 1000], [0, -100]);
  const particlesY = useTransform(scrollY, [0, 1000], [0, -150]);

  // Smooth spring animations
  const springBackgroundY = useSpring(backgroundY, { stiffness: 100, damping: 30 });
  const springOverlayY = useSpring(overlayY, { stiffness: 100, damping: 30 });
  const springParticlesY = useSpring(particlesY, { stiffness: 100, damping: 30 });

  // Optimized mouse tracking with throttling for better performance
  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          setMousePosition({
            x: (clientX / innerWidth - 0.5) * 20,
            y: (clientY / innerHeight - 0.5) * 20,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Main Wallpaper Background */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{ y: springBackgroundY }}
      >
        <Image
          src="/login_background_wallpaper_zignals04.png"
          alt="Zignal Trading Background"
          fill
          className="object-cover object-center will-change-transform"
          style={{
            transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
            transition: 'transform 0.3s ease-out',
          }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          quality={90}
          onError={() => console.log('Image failed to load')}
          unoptimized={false}
        />
      </motion.div>

      {/* Animated Overlay Gradients */}
      <motion.div
        className="absolute inset-0"
        style={{ y: springOverlayY }}
      >
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#040918]/90 via-[#071635]/80 to-[#02040B]/95" />

        {/* Dynamic color overlays */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#33E1DA]/20 via-transparent to-[#1199FA]/20 opacity-60 will-change-transform"
          style={{
            transform: `translate3d(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px, 0)`,
            transition: 'transform 0.5s ease-out',
          }}
        />

        {/* Radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(51,225,218,0.3)_0%,transparent_50%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(17,153,250,0.25)_0%,transparent_60%)] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] opacity-30" />
      </motion.div>

      {/* Animated Particles Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: springParticlesY }}
      >
        <svg
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{
            transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
            transition: 'transform 0.4s ease-out',
          }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Floating particles - reduced count for better performance */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={`${Math.random() * 100}%`}
              cy={`${Math.random() * 100}%`}
              r={Math.random() * 2 + 0.5}
              fill={i % 3 === 0 ? '#33E1DA' : i % 3 === 1 ? '#1199FA' : '#9333EA'}
              opacity={0.6}
              filter="url(#glow)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
                y: [0, -20, -40],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Connecting lines - reduced count for better performance */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="#33E1DA"
              strokeWidth="0.5"
              opacity="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3Ccircle cx='17' cy='37' r='1'/%3E%3Ccircle cx='37' cy='17' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}