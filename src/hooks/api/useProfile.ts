import { ChangePasswordData, User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/providers/supabase-auth-provider';

async function fetchProfile(): Promise<User> {
  const response = await fetch('/api/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const result = await response.json();
  return result.data;
}

async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updateProfile',
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  const result = await response.json();
  return result.data;
}

async function changePassword(data: ChangePasswordData): Promise<void> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'changePassword',
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
}

export function useProfile() {
  const { data: session, status } = useSession();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 300000, // 5 minutes
    enabled: status === 'authenticated' && !!session, // Only run query if user is authenticated
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
