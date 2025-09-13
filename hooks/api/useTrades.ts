import { PaginatedResponse, Trade } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UseTradesParams {
  page?: number;
  limit?: number;
  search?: string;
  pair?: string;
  side?: string;
}

async function fetchTrades(params: UseTradesParams = {}): Promise<PaginatedResponse<Trade>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.pair) searchParams.set('pair', params.pair);
  if (params.side) searchParams.set('side', params.side);

  const response = await fetch(`/api/trades?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch trades');
  }

  const result = await response.json();
  return result.data;
}

export function useTrades(params: UseTradesParams = {}) {
  return useQuery({
    queryKey: ['trades', params],
    queryFn: () => fetchTrades(params),
    staleTime: 30000, // 30 seconds
  });
}
