'use client';

import { useState, useEffect } from 'react';

interface CryptoPriceCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
}

export function CryptoPriceCard({ symbol, name, price, change, marketCap }: CryptoPriceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generate a simple mock chart data
  const generateMockChart = () => {
    const points = [];
    const baseValue = 50;
    for (let i = 0; i < 24; i++) {
      const variation = Math.sin(i * 0.5) * 10 + Math.random() * 5;
      points.push(baseValue + variation);
    }
    return points;
  };

  const chartData = generateMockChart();
  const isPositive = !change.startsWith('-');

  return (
    <div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0577DA] to-[#1199FA] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{symbol.slice(0, 2)}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{name}</h3>
            <p className="text-gray-400 text-sm">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">${price}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </p>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <svg width="100%" height="60" viewBox="0 0 200 60" className="overflow-visible">
          <polyline
            points={chartData.map((point, index) => `${(index / 23) * 200},${60 - point}`).join(' ')}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>

      {/* Market Cap */}
      <div className="text-center">
        <p className="text-gray-400 text-xs mb-1">Market Cap</p>
        <p className="text-white text-sm font-medium">{marketCap}</p>
      </div>

      {/* Action Buttons */}
      <div className={`mt-4 grid grid-cols-2 gap-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button className="bg-[#0577DA] hover:bg-[#0466c4] text-white text-xs py-2 px-3 rounded-lg transition-colors">
          Buy
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-lg transition-colors">
          Trade
        </button>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0577DA]/10 to-[#1199FA]/10 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}
