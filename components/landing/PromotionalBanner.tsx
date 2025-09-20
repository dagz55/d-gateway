'use client';

import { useState, useEffect } from 'react';

export function PromotionalBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "🎉 New User Bonus: $50 in BTC",
      description: "Sign up today and get $50 worth of Bitcoin when you make your first trade",
      cta: "Claim Bonus",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30"
    },
    {
      title: "⚡ Zero Trading Fees",
      description: "Trade Bitcoin, Ethereum, and 400+ cryptos with zero fees for the first 30 days",
      cta: "Start Trading",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      title: "🚀 Advanced Trading Tools",
      description: "Access professional-grade charts, signals, and automated trading strategies",
      cta: "Explore Tools",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30"
    }
  ];

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[currentSlide];

  return (
    <div className="relative overflow-hidden">
      {/* Banner */}
      <div className={`bg-gradient-to-r ${currentBanner.bgGradient} border-b ${currentBanner.borderColor} transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1 text-center">
              <h3 className="text-white font-semibold text-sm md:text-base">
                {currentBanner.title}
              </h3>
              <p className="text-gray-300 text-xs md:text-sm mt-1">
                {currentBanner.description}
              </p>
            </div>
            <button className="bg-[#0577DA] hover:bg-[#0466c4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
              {currentBanner.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 pb-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-[#0577DA] w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
        aria-label="Close banner"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
