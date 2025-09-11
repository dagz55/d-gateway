import { CryptoPrice } from '@/types';
import { useQuery } from '@tanstack/react-query';

async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  const response = await fetch('/api/crypto/prices');
  if (!response.ok) {
    throw new Error('Failed to fetch crypto prices');
  }

  const result = await response.json();
  return result.data;
}

export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: fetchCryptoPrices,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
