'use client';

import { useState, useEffect } from 'react';

export function LiveSignalsChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [currentPrice, setCurrentPrice] = useState(115795.97);
  const [priceChange, setPriceChange] = useState(0.01);
  const [volume24h, setVolume24h] = useState(28542891234);
  const [marketCap, setMarketCap] = useState(2298457362847);
  const [high24h, setHigh24h] = useState(116240.85);
  const [low24h, setLow24h] = useState(114750.22);
  const [rsi, setRsi] = useState(68.7);
  const [macd, setMacd] = useState(245.8);
  const [support, setSupport] = useState(114200);
  const [resistance, setResistance] = useState(116800);

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
        setPriceChange(((newPrice - 115795.97) / 115795.97) * 100);
        return newPrice;
      });

      // Update other metrics
      setVolume24h(prev => prev + (Math.random() - 0.5) * 10000000);
      setRsi(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setMacd(prev => prev + (Math.random() - 0.5) * 10);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    return num.toLocaleString();
  };

  const formatVolume = (num: number) => {
    if (num >= 1e9) {
      return '$' + (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return '$' + (num / 1e6).toFixed(2) + 'M';
    }
    return '$' + num.toLocaleString();
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

      {/* Detailed Trading Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">24h Volume</div>
          <div className="text-white font-semibold text-sm">{formatVolume(volume24h)}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">Market Cap</div>
          <div className="text-white font-semibold text-sm">${formatLargeNumber(marketCap)}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">24h High</div>
          <div className="text-green-400 font-semibold text-sm">${formatPrice(high24h)}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">24h Low</div>
          <div className="text-red-400 font-semibold text-sm">${formatPrice(low24h)}</div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">RSI (14)</div>
          <div className={`font-semibold text-sm ${rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
            {rsi.toFixed(1)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">MACD</div>
          <div className={`font-semibold text-sm ${macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {macd.toFixed(1)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">Support</div>
          <div className="text-blue-400 font-semibold text-sm">${formatPrice(support)}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">Resistance</div>
          <div className="text-orange-400 font-semibold text-sm">${formatPrice(resistance)}</div>
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

          {/* Support and Resistance Lines */}
          {chartData.length > 0 && (
            <>
              {/* Support Line */}
              <line
                x1="25"
                y1={250 - ((support - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25}
                x2="775"
                y2={250 - ((support - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.7"
              />
              {/* Support Label */}
              <text
                x="780"
                y={250 - ((support - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25 + 4}
                fill="#3b82f6"
                fontSize="10"
                className="font-medium"
              >
                Support: ${formatPrice(support)}
              </text>

              {/* Resistance Line */}
              <line
                x1="25"
                y1={250 - ((resistance - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25}
                x2="775"
                y2={250 - ((resistance - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.7"
              />
              {/* Resistance Label */}
              <text
                x="780"
                y={250 - ((resistance - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25 + 4}
                fill="#f59e0b"
                fontSize="10"
                className="font-medium"
              >
                Resistance: ${formatPrice(resistance)}
              </text>
            </>
          )}

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

          {/* Current Price Indicator */}
          {chartData.length > 0 && (
            <>
              <circle
                cx="775"
                cy={250 - ((currentPrice - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25}
                r="4"
                fill={isPositive ? "#10b981" : "#ef4444"}
                className="animate-pulse"
              />
              <text
                x="780"
                y={250 - ((currentPrice - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 200 + 25 - 10}
                fill={isPositive ? "#10b981" : "#ef4444"}
                fontSize="12"
                className="font-bold"
              >
                ${formatPrice(currentPrice)}
              </text>
            </>
          )}
        </svg>

        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">LIVE</span>
        </div>
      </div>

      {/* Enhanced Signal indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-400 mb-2">BUY</div>
          <div className="text-gray-300 text-sm mb-2">Strong Signal</div>
          <div className="text-green-400 text-xs font-semibold mb-1">95% confidence</div>
          <div className="text-gray-400 text-xs">Entry: $115,200</div>
          <div className="text-gray-400 text-xs">Target: $118,500</div>
          <div className="text-gray-400 text-xs">Stop Loss: $113,800</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-yellow-400 mb-2">HOLD</div>
          <div className="text-gray-300 text-sm mb-2">Wait for entry</div>
          <div className="text-yellow-400 text-xs font-semibold mb-1">68% confidence</div>
          <div className="text-gray-400 text-xs">Market volatility</div>
          <div className="text-gray-400 text-xs">Watch: $115,800</div>
          <div className="text-gray-400 text-xs">Next signal: 2-4h</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-400 mb-2">SELL</div>
          <div className="text-gray-300 text-sm mb-2">Take profit</div>
          <div className="text-blue-400 text-xs font-semibold mb-1">87% confidence</div>
          <div className="text-gray-400 text-xs">Target reached</div>
          <div className="text-gray-400 text-xs">Exit: $116,800</div>
          <div className="text-gray-400 text-xs">Profit: +1.2%</div>
        </div>
      </div>

      {/* Additional Trading Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Market Sentiment</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Fear & Greed Index</span>
              <span className="text-green-400 font-semibold">72 (Greed)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Social Sentiment</span>
              <span className="text-yellow-400 font-semibold">Bullish (68%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Whale Activity</span>
              <span className="text-blue-400 font-semibold">High</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Signal Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Win Rate (7d)</span>
              <span className="text-green-400 font-semibold">84.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avg Profit</span>
              <span className="text-green-400 font-semibold">+2.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Active Signals</span>
              <span className="text-blue-400 font-semibold">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
