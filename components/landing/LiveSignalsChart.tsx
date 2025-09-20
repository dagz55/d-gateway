'use client';

import { useState, useEffect } from 'react';

export function LiveSignalsChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [currentPrice, setCurrentPrice] = useState(115782.93);
  const [priceChange, setPriceChange] = useState(-0.77);

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const baseValue = 115000;
      for (let i = 0; i < 50; i++) {
        const variation = Math.sin(i * 0.3) * 5000 + Math.random() * 2000 - 1000;
        data.push(baseValue + variation);
      }
      return data;
    };

    setChartData(generateChartData());

    // Simulate live updates
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const lastValue = newData[newData.length - 1];
        const variation = (Math.random() - 0.5) * 1000;
        newData.shift();
        newData.push(lastValue + variation);
        return newData;
      });

      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 100;
        const newPrice = prev + change;
        setPriceChange(((newPrice - 115782.93) / 115782.93) * 100);
        return newPrice;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const isPositive = priceChange >= 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Bitcoin Live Signals</h3>
          <p className="text-gray-400">Real-time trading signals and market analysis</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            ${formatPrice(currentPrice)}
          </div>
          <div className={`text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width="100%" height="300" viewBox="0 0 800 300" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart line */}
          <polyline
            points={chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 750 + 25;
              const y = 250 - ((point - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />

          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <polygon
            points={`25,275 ${chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 750 + 25;
              const y = 250 - ((point - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25;
              return `${x},${y}`;
            }).join(' ')} 775,275`}
            fill="url(#chartGradient)"
          />
        </svg>

        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">LIVE</span>
        </div>
      </div>

      {/* Signal indicators */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">BUY</div>
          <div className="text-gray-400 text-sm">Strong Signal</div>
          <div className="text-white text-xs mt-1">95% confidence</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">HOLD</div>
          <div className="text-gray-400 text-sm">Wait for entry</div>
          <div className="text-white text-xs mt-1">Market volatility</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">SELL</div>
          <div className="text-gray-400 text-sm">Take profit</div>
          <div className="text-white text-xs mt-1">Target reached</div>
        </div>
      </div>
    </div>
  );
}
