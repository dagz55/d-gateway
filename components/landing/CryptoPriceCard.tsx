'use client';

import { useEffect, useState } from 'react';

interface CryptoPriceCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
}

interface ChartDataPoint {
  value: number;
  timestamp: number;
  date: string;
  time: string;
}

export function CryptoPriceCard({ symbol, name, price, change, marketCap }: CryptoPriceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const generateMockChart = (seed: string): ChartDataPoint[] => {
    const points: ChartDataPoint[] = [];
    const baseValue = 50;
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }

    // Generate data for the last 24 hours
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const timestamp = now.getTime() - (23 - i) * 60 * 60 * 1000; // Each point represents 1 hour
      const date = new Date(timestamp);
      const variation = Math.sin(i * 0.5 + seedValue * 0.1) * 10 + Math.sin(i + seedValue) * 5;
      const value = baseValue + variation;
      
      points.push({
        value,
        timestamp,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
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

      <div 
        className="relative mt-6 h-16 w-full"
        onMouseMove={(e) => {
          if (!mounted || chartData.length === 0) return;
          
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePosition({ x: e.clientX, y: e.clientY });
          
          // Find the closest data point
          const chartWidth = 200;
          const chartHeight = 80;
          const pointIndex = Math.round((x / rect.width) * (chartData.length - 1));
          const clampedIndex = Math.max(0, Math.min(pointIndex, chartData.length - 1));
          setHoveredPoint(chartData[clampedIndex]);
        }}
        onMouseLeave={() => {
          setHoveredPoint(null);
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 80" className="overflow-visible">
          {mounted && chartData.length > 0 && (
            <>
              <defs>
                <linearGradient id={`spark-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <pattern id={`grid-${symbol}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              
              {/* Grid background */}
              <rect width="200" height="80" fill={`url(#grid-${symbol})`} />
              
              {/* Horizontal grid lines */}
              {[0, 20, 40, 60, 80].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="200"
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Vertical grid lines */}
              {[0, 40, 80, 120, 160, 200].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="80"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Area fill */}
              <path
                d={`M 0 80 ${chartData
                  .map((point, index) => `L ${(index / (chartData.length - 1)) * 200} ${80 - point.value}`)
                  .join(' ')} L 200 80 Z`}
                fill={`url(#spark-${symbol})`}
                stroke="none"
              />
              
              {/* Line */}
              <polyline
                points={chartData
                  .map((point, index) => `${(index / (chartData.length - 1)) * 200},${80 - point.value}`)
                  .join(' ')}
                fill="none"
                stroke={isPositive ? '#34d399' : '#f87171'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_4px_12px_rgba(52,211,153,0.35)]"
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 200;
                const y = 80 - point.value;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={isPositive ? '#34d399' : '#f87171'}
                    opacity="0.6"
                    className="hover:opacity-100 transition-opacity"
                  />
                );
              })}
            </>
          )}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 rounded-lg bg-black/90 border border-white/20 px-3 py-2 text-xs text-white backdrop-blur-sm pointer-events-none"
            style={{
              left: `${Math.min(Math.max(mousePosition.x - 100, 10), 190)}px`,
              top: `${Math.max(mousePosition.y - 80, 10)}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-semibold text-white">{name}</div>
            <div className="text-white/80">${hoveredPoint.value.toFixed(2)}</div>
            <div className="text-white/60">{hoveredPoint.date}</div>
            <div className="text-white/60">{hoveredPoint.time}</div>
          </div>
        )}
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
