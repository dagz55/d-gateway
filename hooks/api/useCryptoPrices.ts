import { ApiResponse, CryptoPrice } from '@/types';
import { useQuery } from '@tanstack/react-query';

async function fetchCryptoPrices(): Promise<ApiResponse<CryptoPrice[]>> {
  const response = await fetch('/api/crypto/prices');
  if (!response.ok) {
    throw new Error('Failed to fetch crypto prices');
  }

  return response.json();
}

export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: fetchCryptoPrices,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
