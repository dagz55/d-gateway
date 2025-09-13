import { PaginatedResponse, Signal } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UseSignalsParams {
  page?: number;
  limit?: number;
  search?: string;
  pair?: string;
  action?: string;
}

async function fetchSignals(params: UseSignalsParams = {}): Promise<PaginatedResponse<Signal>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.pair) searchParams.set('pair', params.pair);
  if (params.action) searchParams.set('action', params.action);

  const response = await fetch(`/api/signals?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch signals');
  }

  const result = await response.json();
  return result.data;
}

export function useSignals(params: UseSignalsParams = {}) {
  return useQuery({
    queryKey: ['signals', params],
    queryFn: () => fetchSignals(params),
    staleTime: 30000, // 30 seconds
  });
}
