'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

export interface MarketStats {
  totalMarketCap: number;
  total24hVolume: number;
  gainersCount: number;
  losersCount: number;
  dominanceBTC: number;
}

export function useMarketData() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMarketData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError(null);

      // Fetch top 100 cryptocurrencies with sparkline data
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d',
        { signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`);
      }

      const data: CryptoData[] = await response.json();

      // Calculate market statistics
      const totalMarketCap = data.reduce((sum, crypto) => sum + (crypto.market_cap || 0), 0);
      const total24hVolume = data.reduce((sum, crypto) => sum + (crypto.volume_24h || 0), 0);
      const gainersCount = data.filter(crypto => (crypto.price_change_percentage_24h || 0) > 0).length;
      const losersCount = data.filter(crypto => (crypto.price_change_percentage_24h || 0) < 0).length;

      // Calculate Bitcoin dominance
      const btcMarketCap = data.find(crypto => crypto.id === 'bitcoin')?.market_cap || 0;
      const dominanceBTC = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;

      setCryptoData(data);
      setMarketStats({
        totalMarketCap,
        total24hVolume,
        gainersCount,
        losersCount,
        dominanceBTC
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        console.error('Error fetching market data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden && cryptoData.length === 0) {
        // Fetch data when page becomes visible and we don't have data
        fetchMarketData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchMarketData, cryptoData.length]);

  // Auto-refresh every 30 seconds when visible
  useEffect(() => {
    fetchMarketData();

    const interval = setInterval(() => {
      if (isVisible) {
        fetchMarketData();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMarketData, isVisible]);

  const refetch = useCallback(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return {
    cryptoData,
    marketStats,
    loading,
    error,
    lastUpdated,
    isVisible,
    refetch
  };
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