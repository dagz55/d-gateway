'use client';

import { useEffect, useState } from 'react';

interface CryptoPriceCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
}

export function CryptoPriceCard({ symbol, name, price, change, marketCap }: CryptoPriceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [chartData, setChartData] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  const generateMockChart = (seed: string) => {
    const points: number[] = [];
    const baseValue = 50;
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }

    for (let i = 0; i < 24; i++) {
      const variation = Math.sin(i * 0.5 + seedValue * 0.1) * 10 + Math.sin(i + seedValue) * 5;
      points.push(baseValue + variation);
    }
    return points;
  };

  useEffect(() => {
    setMounted(true);
    setChartData(generateMockChart(symbol));
  }, [symbol]);

  const isPositive = !change.startsWith('-');

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0577DA]/20 via-transparent to-transparent" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0577DA] to-[#1199FA] text-sm font-semibold text-white">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{name}</h3>
            <p className="text-xs text-white/50">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">${price}</p>
          <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-300' : 'text-red-400'}`}>{change}</p>
        </div>
      </div>

      <div className="relative mt-6 h-16 w-full">
        <svg width="100%" height="100%" viewBox="0 0 200 80" className="overflow-visible">
          {mounted && chartData.length > 0 && (
            <>
              <defs>
                <linearGradient id={`spark-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 80 ${chartData
                  .map((point, index) => `L ${(index / (chartData.length - 1)) * 200} ${80 - point}`)
                  .join(' ')} L 200 80 Z`}
                fill={`url(#spark-${symbol})`}
                stroke="none"
              />
              <polyline
                points={chartData
                  .map((point, index) => `${(index / (chartData.length - 1)) * 200},${80 - point}`)
                  .join(' ')}
                fill="none"
                stroke={isPositive ? '#34d399' : '#f87171'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_4px_12px_rgba(52,211,153,0.35)]"
              />
            </>
          )}
        </svg>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-white/50">
        <span>Market cap</span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] font-semibold text-white/70">
          {marketCap}
        </span>
      </div>

      <div
        className={`relative mt-6 grid grid-cols-2 gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button className="rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-4 py-2 text-xs font-semibold text-white transition hover:from-[#0a8ae8] hover:to-[#22a9ff]">
          Buy
        </button>
        <button className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
          Trade
        </button>
      </div>
    </div>
  );
}
