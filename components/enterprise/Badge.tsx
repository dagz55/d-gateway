"use client"

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'base' | 'lg'
  dot?: boolean
  children: React.ReactNode
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({
  variant = 'default',
  size = 'base',
  dot = false,
  children,
  className,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-swift"
  
  const variants = {
    default: "bg-[#1E2A44]/60 text-[#EAF2FF] border border-[#33E1DA]/20",
    brand: "bg-[#33E1DA] text-[#0A0F1F] border border-[#33E1DA]/50",
    success: "bg-green-600/20 text-green-400 border border-green-600/30",
    warning: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30", 
    danger: "bg-red-600/20 text-red-400 border border-red-600/30",
    info: "bg-[#1A7FB3]/20 text-[#1A7FB3] border border-[#1A7FB3]/30",
    outline: "bg-transparent text-[#EAF2FF]/80 border border-[#33E1DA]/30 hover:bg-[#33E1DA]/10"
  }
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-md gap-1",
    base: "px-2.5 py-1 text-sm rounded-md gap-1.5",
    lg: "px-3 py-1.5 text-sm rounded-lg gap-2"
  }

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <div className={cn(
          "rounded-full flex-shrink-0",
          size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2',
          variant === 'brand' && 'bg-[#33E1DA]',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'info' && 'bg-[#1A7FB3]',
          variant === 'default' && 'bg-[#EAF2FF]/60',
          variant === 'outline' && 'bg-[#EAF2FF]/60'
        )} />
      )}
      {children}
    </div>
  )
})

Badge.displayName = 'Badge'

export { Badge }