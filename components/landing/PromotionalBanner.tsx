'use client';

import { useEffect, useMemo, useState } from 'react';

interface BannerItem {
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
}

export function PromotionalBanner() {
  const banners: BannerItem[] = useMemo(
    () => [
      {
        title: 'Cryptocurrency trading made simple',
        description: 'Want to experience risk-free trading? Go ahead and purchase our trade signals packages!',
        cta: 'Get Started',
        href: '#pricing',
        accent: 'from-[#57c8ff]/20 via-[#1199FA]/20 to-[#9333EA]/20',
      },
      {
        title: 'Package price will depend on the duration of the availed packages',
        description: 'Choose from flexible pricing options that scale with your trading needs and commitment level.',
        cta: 'View Packages',
        href: '#pricing',
        accent: 'from-[#34d399]/20 via-[#0577DA]/20 to-[#22d3ee]/20',
      },
      {
        title: 'Having a hard time mastering the art of cryptocurrency?',
        description: 'Fret not, we have you covered. Reach out to your Zignals advisor to learn more.',
        cta: 'Contact Advisor',
        href: '#support',
        accent: 'from-[#f97316]/20 via-[#facc15]/20 to-[#22d3ee]/20',
      },
    ],
    []
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  if (!isOpen) {
    return null;
  }

  const currentBanner = banners[currentSlide];

  return (
    <div
      className="relative overflow-hidden border-b border-white/10 bg-[#020712]/95 text-white z-30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-live="polite"
    >
      <div className={`bg-gradient-to-r ${currentBanner.accent} transition-all duration-500`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/50">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Breaking update
            </div>
            <h3 className="mt-2 text-base font-semibold sm:text-lg">{currentBanner.title}</h3>
            <p className="mt-1 text-sm text-white/70 sm:max-w-2xl">{currentBanner.description}</p>
          </div>
          <a
            href={currentBanner.href}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white sm:w-auto"
          >
            {currentBanner.cta}
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2 pb-2">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
        aria-label="Dismiss announcement"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
