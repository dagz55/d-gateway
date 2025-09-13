import { NewsItem, PaginatedResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UseNewsParams {
  page?: number;
  limit?: number;
  search?: string;
}

async function fetchNews(params: UseNewsParams = {}): Promise<PaginatedResponse<NewsItem>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);

  const response = await fetch(`/api/news?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  const result = await response.json();
  return result.data;
}

export function useNews(params: UseNewsParams = {}) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => fetchNews(params),
    staleTime: 60000, // 1 minute
  });
}
