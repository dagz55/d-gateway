'use client';

import { useEffect, useCallback, useRef } from 'react';

interface MagneticScrollOptions {
  threshold?: number;
  duration?: number;
  offset?: number;
}

export function useMagneticScroll(options: MagneticScrollOptions = {}) {
  const { threshold = 0.3, duration = 800, offset = 100 } = options;
  const isScrollingRef = useRef(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element || isScrollingRef.current) return;

    isScrollingRef.current = true;

    const elementTop = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = elementTop - startPosition;
    let startTime: number;

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animateScroll = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrollingRef.current = false;
      }
    };

    requestAnimationFrame(animateScroll);
  }, [duration, offset]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && !isScrollingRef.current) {
        requestAnimationFrame(() => {
          const sections = document.querySelectorAll('[data-magnetic-section]');
          const windowHeight = window.innerHeight;
          const scrollTop = window.pageYOffset;

          sections.forEach((section) => {
            const element = section as HTMLElement;
            const rect = element.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = rect.height;
            const sectionCenter = sectionTop + sectionHeight / 2;
            const windowCenter = scrollTop + windowHeight / 2;

            const distanceFromCenter = Math.abs(sectionCenter - windowCenter);
            const maxDistance = windowHeight / 2 + sectionHeight / 2;
            const proximityRatio = 1 - distanceFromCenter / maxDistance;

            // Apply magnetic effect when close enough
            if (proximityRatio > threshold) {
              const magneticStrength = Math.pow(proximityRatio - threshold, 2) * 5;

              if (magneticStrength > 0.8) {
                scrollToSection(element.id);
              }
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, scrollToSection]);

  return { scrollToSection };
}