'use client';

import { useEffect, useState } from 'react';
import { LiveSignalsChart } from './LiveSignalsChart';
import { LoginPanel } from './LoginPanel';
import { PromotionalBanner } from './PromotionalBanner';

// Crypto trading grid pattern
const TRADING_GRID_PATTERN = "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2333E1DA' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3Cg stroke='%2333E1DA' stroke-opacity='0.1' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E";

// Cryptocurrency symbols and trading data
const CRYPTO_SYMBOLS = ['₿', '⟠', '◊', '$', '∑', '⧫', '◈', '⬟'];
const PRICE_CHANGES = ['+2.4%', '-1.3%', '+5.7%', '+0.8%', '-3.2%', '+4.1%', '-0.5%', '+7.2%'];

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function ZignalLanding() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Use fixed values for SSR, dynamic values only on client
  const getAnimationValues = (index: number) => {
    if (!isClient) {
      return {
        baseY: 300,
        height: 30,
        isGreen: index % 2 === 0,
        animationDelay: `${index * 0.1}s`,
        animationDuration: `${15}s`
      };
    }
    
    return {
      baseY: 300 + Math.sin(index * 0.5) * 50,
      height: 20 + pseudoRandom(index + 201) * 40,
      isGreen: pseudoRandom(index + 301) > 0.5,
      animationDelay: `${index * 0.1}s`,
      animationDuration: `${12 + pseudoRandom(index + 1) * 8}s`
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d5a87] to-[#1a365d] flex flex-col">
      {/* Promotional Banner at the top */}
      <PromotionalBanner />

      {/* Main content area */}
      <div className="flex flex-1">
      {/* Left Panel - Main Content */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 relative overflow-hidden">
        {/* Enhanced Crypto Trading Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#1a365d] to-[#0a0f1f]">
          {/* Trading Grid */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0 bg-repeat"
              style={{ backgroundImage: `url('${TRADING_GRID_PATTERN}')` }}
            />
          </div>

          {/* Cryptocurrency Symbols Floating */}
          <div className="absolute inset-0 overflow-hidden">
            {CRYPTO_SYMBOLS.map((symbol, i) => (
              <div
                key={`crypto-${i}`}
                className="absolute text-[#33E1DA]/20 font-bold text-4xl animate-crypto-float"
                style={{
                  left: `${(i * 12 + 5) % 100}%`,
                  top: `${(i * 15 + 10) % 80}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: isClient ? `${12 + pseudoRandom(i + 1) * 8}s` : '15s'
                }}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Price Change Indicators */}
          <div className="absolute inset-0 overflow-hidden">
            {PRICE_CHANGES.map((change, i) => {
              const isPositive = change.startsWith('+');
              return (
                <div
                  key={`price-${i}`}
                  className={`absolute text-xs font-mono font-medium animate-price-drift ${
                    isPositive ? 'text-[#22c55e]/40' : 'text-[#ef4444]/40'
                  }`}
                  style={{
                    left: `${(i * 13 + 8) % 95}%`,
                    top: `${(i * 11 + 15) % 85}%`,
                    animationDelay: `${i * 1.5 + 3}s`,
                    animationDuration: isClient ? `${8 + pseudoRandom(i + 101) * 4}s` : '10s'
                  }}
                >
                  {change}
                </div>
              );
            })}
          </div>

          {/* Trading Candlesticks Animation */}
          <div className="absolute inset-0 opacity-15">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 600">
              {/* Generate candlestick patterns */}
              {[...Array(24)].map((_, i) => {
                const x = (i * 50) + 50;
                const values = getAnimationValues(i);
                return (
                  <g key={`candle-${i}`} className="animate-candle-pulse" style={{ animationDelay: values.animationDelay }}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={values.baseY - values.height/2 - 10}
                      x2={x}
                      y2={values.baseY + values.height/2 + 10}
                      stroke={values.isGreen ? "#22c55e" : "#ef4444"}
                      strokeWidth="1"
                      opacity="0.6"
                    />
                    {/* Body */}
                    <rect
                      x={x - 8}
                      y={values.baseY - values.height/2}
                      width="16"
                      height={values.height}
                      fill={values.isGreen ? "#22c55e" : "#ef4444"}
                      opacity="0.4"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Market Data Streams */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={`stream-${i}`}
                className="absolute w-px h-32 bg-gradient-to-b from-transparent via-[#33E1DA]/30 to-transparent animate-data-stream"
                style={{
                  left: `${(i * 8 + 3) % 100}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${4 + pseudoRandom(i + 401) * 2}s`
                }}
              />
            ))}
          </div>

          {/* Trading Volume Bars */}
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
            <div className="flex items-end justify-center h-full space-x-1">
              {[...Array(50)].map((_, i) => (
                <div
                  key={`volume-${i}`}
                  className="bg-[#33E1DA] animate-volume-pulse"
                  style={{
                    width: '2px',
                    height: isClient ? `${pseudoRandom(i + 501) * 80 + 20}%` : `${(i % 5 + 1) * 20}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: isClient ? `${3 + pseudoRandom(i + 601) * 2}s` : '4s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Chart Lines */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 500">
              {/* Main trend line */}
              <path
                d="M0,350 Q100,250 200,280 Q300,200 400,240 Q500,180 600,220 Q700,160 800,200 Q900,140 1000,180"
                stroke="#33E1DA"
                strokeWidth="2"
                fill="none"
                className="animate-chart-draw"
              />
              {/* Support line */}
              <path
                d="M0,400 L200,390 L400,380 L600,370 L800,360 L1000,350"
                stroke="#1A7FB3"
                strokeWidth="1"
                fill="none"
                className="animate-chart-draw"
                style={{ animationDelay: '1s' }}
              />
              {/* Resistance line */}
              <path
                d="M0,200 L200,210 L400,220 L600,230 L800,240 L1000,250"
                stroke="#ef4444"
                strokeWidth="1"
                fill="none"
                className="animate-chart-draw"
                style={{ animationDelay: '2s' }}
              />
            </svg>
          </div>

          {/* Glowing Orbs for Depth */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-[#33E1DA]/10 rounded-full blur-3xl animate-crypto-glow" />
            <div className="absolute top-2/3 right-1/4 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-2xl animate-crypto-glow-delayed" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#1A7FB3]/15 rounded-full blur-xl animate-crypto-pulse" />
          </div>
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Master Crypto Trading.
            </h1>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Zignal</span>{' '}
              <span className="text-white">transforms</span>
            </h2>
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              market signals into
            </h2>
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              profitable trades.
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-xl">
            Access professional crypto trading signals, real-time market analysis, and advanced portfolio management tools.
          </p>

          {/* Crypto Stats Bar */}
          <div className="mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-[#33E1DA]/20">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span>Live Market</span>
              <span className="text-[#33E1DA]">Real-time Data</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-white/50">BTC/USD</div>
                <div className="text-[#22c55e] font-mono">↗ Live</div>
              </div>
              <div>
                <div className="text-white/50">ETH/USD</div>
                <div className="text-[#22c55e] font-mono">↗ Live</div>
              </div>
              <div>
                <div className="text-white/50">Market</div>
                <div className="text-[#33E1DA] font-mono">Active</div>
              </div>
            </div>
          </div>

          {/* Live Signals Component */}
          <LiveSignalsChart />
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full max-w-md bg-[#0f172a]/95 backdrop-blur-sm border-l border-white/10">
        <LoginPanel />
      </div>
      </div>
    </div>
  )
}
