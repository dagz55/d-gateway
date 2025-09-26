'use client';

import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export default function StatusDot({ status, className }: StatusDotProps) {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    neutral: 'bg-gray-500'
  };

  return (
    <div className={cn(
      'w-2 h-2 rounded-full',
      statusColors[status],
      className
    )} />
  );
}