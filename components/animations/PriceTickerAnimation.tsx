'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceData {
  symbol: string;
  price: string;
  change: number;
  changePercent: string;
}

const mockPriceData: PriceData[] = [
  { symbol: 'BTC', price: '$115,782', change: 2.4, changePercent: '+2.4%' },
  { symbol: 'ETH', price: '$4,471', change: -1.3, changePercent: '-1.3%' },
  { symbol: 'SOL', price: '$239', change: 5.7, changePercent: '+5.7%' },
  { symbol: 'ADA', price: '$1.23', change: 0.8, changePercent: '+0.8%' },
  { symbol: 'DOT', price: '$8.45', change: -3.2, changePercent: '-3.2%' },
  { symbol: 'LINK', price: '$25.67', change: 4.1, changePercent: '+4.1%' },
  { symbol: 'MATIC', price: '$0.89', change: -0.5, changePercent: '-0.5%' },
  { symbol: 'AVAX', price: '$45.32', change: 7.2, changePercent: '+7.2%' },
];

export function PriceTickerAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockPriceData.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const currentData = mockPriceData[currentIndex];
  const isPositive = currentData.change > 0;

  return (
    <div className="absolute top-4 right-4 z-20">
      <div 
        className={`
          bg-card/80 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2 
          transition-all duration-300 transform
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          animate-pulse-glow
        `}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">
              {currentData.symbol}
            </span>
            <div className={`w-2 h-2 rounded-full animate-live-pulse ${
              isPositive ? 'bg-chart-3' : 'bg-destructive'
            }`} />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {currentData.price}
            </span>
            
            <div className={`flex items-center gap-1 ${
              isPositive ? 'text-chart-3' : 'text-destructive'
            }`}>
              {isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="text-xs font-medium animate-price-ticker">
                {currentData.changePercent}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}