import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColors = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-zincyan',
  neutral: 'bg-gray-500',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export default function StatusDot({ 
  status, 
  size = 'md', 
  className 
}: StatusDotProps) {
  return (
    <div
      className={cn(
        "rounded-full",
        statusColors[status],
        sizeClasses[size],
        className
      )}
    />
  );
}
