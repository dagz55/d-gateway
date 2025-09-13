import { DepositData, PaginatedResponse, Transaction } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseDepositsParams {
  page?: number;
  limit?: number;
}

async function fetchDeposits(params: UseDepositsParams = {}): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  searchParams.set('type', 'DEPOSIT');

  const response = await fetch(`/api/deposits?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch deposits');
  }

  const result = await response.json();
  return result.data;
}

async function createDeposit(data: DepositData): Promise<Transaction> {
  const response = await fetch('/api/deposits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create deposit');
  }

  const result = await response.json();
  return result.data;
}

export function useDeposits(params: UseDepositsParams = {}) {
  return useQuery({
    queryKey: ['deposits', params],
    queryFn: () => fetchDeposits(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
