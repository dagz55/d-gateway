'use client';

import { ChevronRight } from 'lucide-react';

// Using config file for banners - fallback to demo data if config fails
const promoBanners = [
  {
    id: 1,
    title: "🚀 CRYPTO SIGNALS LIVE NOW!",
    subtitle: "₿ BTC/ETH Signals • 95% Win Rate • Real-Time Alerts ₿",
    cta: "⚡ GET PREMIUM SIGNALS NOW - LIMITED TIME! ⚡",
    icon: "Bitcoin",
    gradient: "from-[#f7931a] via-[#33E1DA] to-[#22c55e]",
    accent: "#f7931a",
    cryptoSymbol: "₿",
    priceChange: "+12.5%",
    isPositive: true
  },
  {
    id: 2,
    title: "💎 EXCLUSIVE TRADING PACKAGES",
    subtitle: "🔥 Choose Your Duration: Daily • Weekly • Monthly 🔥",
    cta: "💰 SAVE 40% ON YEARLY PLANS - ACT NOW! 💰",
    icon: "Package",
    gradient: "from-[#22c55e] via-[#33E1DA] to-[#8b5cf6]",
    accent: "#22c55e",
    cryptoSymbol: "⟠",
    priceChange: "+8.7%",
    isPositive: true
  },
  {
    id: 3,
    title: "🎯 MASTER CRYPTO TRADING",
    subtitle: "📈 Expert Advisors • 24/7 Support • Proven Strategies 📈",
    cta: "🔥 BOOK FREE CONSULTATION - 50 SPOTS LEFT! 🔥",
    icon: "BarChart3",
    gradient: "from-[#1A7FB3] via-[#33E1DA] to-[#f7931a]",
    accent: "#1A7FB3",
    cryptoSymbol: "◊",
    priceChange: "+15.2%",
    isPositive: true
  }
];

export function PromotionalBanner() {
  return (
    <div className="relative w-full bg-gradient-to-r from-[#000000] via-[#0a0f1f] to-[#000000] border-b-2 border-[#f7931a] overflow-hidden shadow-lg">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        {/* Gentle Bitcoin Orange Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7931a]/10 via-transparent to-[#f7931a]/10" />

        {/* Simple Crypto Symbols */}
        <div className="absolute inset-0 overflow-hidden">
          {['₿', '⟠', '◊'].map((symbol, i) => (
            <div
              key={`bg-crypto-${i}`}
              className="absolute text-[#f7931a]/5 font-bold text-4xl"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Simple top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f7931a] to-[#33E1DA]" />

      {/* Scrolling Banner Content */}
      <div className="relative py-4">
        <div className="flex animate-scroll-right-to-left">
          {/* Repeat the banners to create seamless scrolling */}
          {[...promoBanners, ...promoBanners].map((banner, index) => {
            const IconComponent = banner.icon;
            return (
              <div key={`banner-${index}`} className="flex items-center min-w-max px-8 space-x-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg bg-gradient-to-br ${banner.gradient} shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex items-center space-x-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {banner.title}
                    </h3>
                    <p className="text-[#33E1DA] text-sm">
                      {banner.subtitle}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="text-[#f7931a] font-bold text-sm">
                    {banner.cta}
                  </div>

                  {/* Price Display */}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl text-[#f7931a]">
                      {banner.cryptoSymbol}
                    </span>
                    <span className="text-[#22c55e] text-sm font-mono">
                      {banner.priceChange}
                    </span>
                  </div>

                  {/* Live indicator */}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                    <span className="text-[#22c55e] text-xs font-mono">LIVE</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="w-px h-8 bg-white/20 mx-4" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}