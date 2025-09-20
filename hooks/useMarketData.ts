"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: number;
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

// Enhanced market data generator with more realistic patterns
const generateRealisticMarketData = (symbol: string): MarketData => {
  const basePrice = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3200 : 1;
  const volatility = symbol === 'BTC' ? 0.05 : 0.08;
  
  // Use current time for more realistic updates
  const now = Date.now();
  
  // Generate price with trend and noise
  const trendFactor = Math.sin(now / (1000 * 60 * 60 * 24)) * 0.02; // Daily trend
  const noiseFactor = (Math.random() - 0.5) * volatility;
  const price = basePrice * (1 + trendFactor + noiseFactor);
  
  const change24h = price * (trendFactor + (Math.random() - 0.5) * 0.03);
  const changePercent24h = (change24h / (price - change24h)) * 100;
  
  return {
    symbol,
    price,
    change24h,
    changePercent24h,
    volume24h: Math.random() * 50000000000 + 10000000000,
    marketCap: price * (symbol === 'BTC' ? 19700000 : 120000000),
    high24h: price * (1 + Math.random() * 0.05),
    low24h: price * (1 - Math.random() * 0.05),
    lastUpdated: now
  };
};

// Generate realistic candlestick data with proper OHLC relationships
const generateRealisticCandlestickData = (
  timeframe: string, 
  count: number = 100,
  basePrice: number = 65000
): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  
  const timeMultipliers = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  };
  
  const timeMultiplier = timeMultipliers[timeframe as keyof typeof timeMultipliers] || timeMultipliers['1h'];
  
  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * timeMultiplier);
    
    // Generate realistic price movement
    const volatility = 0.02;
    const trendComponent = Math.sin(i * 0.1) * 0.005;
    const randomWalk = (Math.random() - 0.5) * volatility;
    const priceChange = currentPrice * (trendComponent + randomWalk);
    
    const open = currentPrice;
    const close = open + priceChange;
    
    // Generate high and low with realistic relationships
    const maxPrice = Math.max(open, close);
    const minPrice = Math.min(open, close);
    const high = maxPrice + (Math.random() * currentPrice * 0.01);
    const low = minPrice - (Math.random() * currentPrice * 0.01);
    
    // Generate volume with some correlation to price movement
    const volatilityFactor = Math.abs(priceChange) / currentPrice;
    const baseVolume = 1000000 + Math.random() * 5000000;
    const volume = baseVolume * (1 + volatilityFactor * 10);
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });
    
    currentPrice = close;
  }
  
  return data.reverse();
};

// Optimized technical indicator calculations
const calculateOptimizedTechnicalIndicators = (
  data: CandlestickData[], 
  index: number
): TechnicalIndicators => {
  const prices = data.slice(Math.max(0, index - 50), index + 1).map(d => d.close);
  
  if (prices.length < 14) {
    return {
      rsi: 50,
      macd: 0,
      sma20: prices[prices.length - 1] || 0,
      sma50: prices[prices.length - 1] || 0,
      bollinger: {
        upper: prices[prices.length - 1] || 0,
        middle: prices[prices.length - 1] || 0,
        lower: prices[prices.length - 1] || 0
      }
    };
  }
  
  // Optimized RSI calculation
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < Math.min(prices.length, 15); i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
  const rs = avgGain / (avgLoss || 1);
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  
  // Moving averages
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length);
  
  // MACD
  const macd = ((sma20 - sma50) / sma20) * 100;
  
  // Bollinger Bands
  const recentPrices = prices.slice(-20);
  const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / recentPrices.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    rsi: Math.max(0, Math.min(100, rsi)),
    macd,
    sma20,
    sma50,
    bollinger: {
      upper: mean + (stdDev * 2),
      middle: mean,
      lower: mean - (stdDev * 2)
    }
  };
};

export const useMarketData = (symbol: string = 'BTC', updateInterval: number = 2000) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  
  const fetchMarketData = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll generate realistic mock data
      const data = generateRealisticMarketData(symbol);
      setMarketData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    }
  }, [symbol]);
  
  const generateCandlestickData = useCallback((timeframe: string) => {
    const data = generateRealisticCandlestickData(timeframe, 100);
    setCandlestickData(data);
  }, []);
  
  const updateLiveData = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < updateInterval) return;
    
    lastUpdateRef.current = now;
    
    setCandlestickData(prevData => {
      if (prevData.length === 0) return prevData;
      
      const lastCandle = { ...prevData[prevData.length - 1] };
      const volatility = 0.001;
      const change = lastCandle.close * (Math.random() - 0.5) * volatility;
      const newClose = Math.max(0, lastCandle.close + change);
      
      const updatedCandle: CandlestickData = {
        ...lastCandle,
        close: newClose,
        high: Math.max(lastCandle.high, newClose),
        low: Math.min(lastCandle.low, newClose),
        volume: lastCandle.volume + Math.random() * 100000,
        timestamp: now
      };
      
      return [...prevData.slice(0, -1), updatedCandle];
    });
    
    // Update market data
    fetchMarketData();
  }, [updateInterval, fetchMarketData]);
  
  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchMarketData();
      generateCandlestickData('1h');
      setIsLoading(false);
    };
    
    initializeData();
  }, [fetchMarketData, generateCandlestickData]);
  
  // Start live updates
  useEffect(() => {
    intervalRef.current = setInterval(updateLiveData, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateLiveData, updateInterval]);
  
  const getTechnicalIndicators = useCallback((index: number): TechnicalIndicators => {
    if (candlestickData.length === 0 || index >= candlestickData.length) {
      return {
        rsi: 50,
        macd: 0,
        sma20: 0,
        sma50: 0,
        bollinger: { upper: 0, middle: 0, lower: 0 }
      };
    }
    
    return calculateOptimizedTechnicalIndicators(candlestickData, index);
  }, [candlestickData]);
  
  const getSupportResistanceLevels = useCallback(() => {
    if (candlestickData.length === 0) return { support: [], resistance: [] };
    
    const highs = candlestickData.map(d => d.high).sort((a, b) => b - a);
    const lows = candlestickData.map(d => d.low).sort((a, b) => a - b);
    
    return {
      resistance: highs.slice(0, 3),
      support: lows.slice(0, 3)
    };
  }, [candlestickData]);
  
  return {
    marketData,
    candlestickData,
    isLoading,
    error,
    getTechnicalIndicators,
    getSupportResistanceLevels,
    generateCandlestickData,
    refreshData: fetchMarketData
  };
};

// Legacy interface for backward compatibility
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
  market_cap_rank: number;
}

// Utility functions for formatting
export const formatPrice = (price: number | undefined | null): string => {
  if (!price || price === 0) {
    return '$0.00';
  }
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(6)}`;
};

export const formatMarketCap = (marketCap: number | undefined | null): string => {
  if (!marketCap || marketCap === 0) {
    return '$0';
  }
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
};

export const formatVolume = (volume: number | undefined | null): string => {
  if (!volume || volume === 0) {
    return '$0';
  }
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  }
  if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  }
  return `$${volume.toLocaleString()}`;
};

export const formatPercentage = (percentage: number | undefined | null): string => {
  if (percentage === undefined || percentage === null) {
    return '0.00%';
  }
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};