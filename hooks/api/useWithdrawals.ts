import { PaginatedResponse, Transaction, WithdrawData } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseWithdrawalsParams {
  page?: number;
  limit?: number;
}

async function fetchWithdrawals(params: UseWithdrawalsParams = {}): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  searchParams.set('type', 'WITHDRAWAL');

  const response = await fetch(`/api/withdrawals?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch withdrawals');
  }

  const result = await response.json();
  return result.data;
}

async function createWithdrawal(data: WithdrawData): Promise<Transaction> {
  const response = await fetch('/api/withdrawals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create withdrawal');
  }

  const result = await response.json();
  return result.data;
}

export function useWithdrawals(params: UseWithdrawalsParams = {}) {
  return useQuery({
    queryKey: ['withdrawals', params],
    queryFn: () => fetchWithdrawals(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
