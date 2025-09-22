'use client';

import { useQuery } from '@tanstack/react-query';

interface ChartDataPoint {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BitcoinChartData {
  symbol: string;
  current_price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  high_24h: number;
  low_24h: number;
  chart_data: ChartDataPoint[];
  last_updated: string;
}

export function useBitcoinChart(days: string = '1') {
  return useQuery<BitcoinChartData>({
    queryKey: ['bitcoin-chart', days],
    queryFn: async () => {
      const response = await fetch(`/api/crypto/bitcoin-chart?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin chart data');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}