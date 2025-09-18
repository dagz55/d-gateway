"use client"

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'base' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'base',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false)

  const baseStyles = "btn relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "bg-gradient-to-b from-[#1A7FB3] to-[#33E1DA] text-[#EAF2FF] shadow-sm hover:from-[#33E1DA] hover:to-[#1A7FB3] hover:shadow-md active:shadow-sm border border-[#33E1DA]/20",
    secondary: "bg-[#1E2A44]/60 text-[#EAF2FF] border border-[#33E1DA]/30 shadow-xs hover:bg-[#1E2A44]/80 hover:border-[#33E1DA]/50 hover:shadow-sm active:bg-[#1E2A44]/40",
    outline: "bg-transparent border border-[#33E1DA]/30 text-[#EAF2FF] hover:bg-[#33E1DA]/10 hover:border-[#33E1DA]/50 active:bg-[#33E1DA]/20",
    ghost: "bg-transparent text-[#EAF2FF]/80 hover:bg-[#1E2A44]/30 hover:text-[#EAF2FF] active:bg-[#1E2A44]/50",
    danger: "bg-gradient-to-b from-red-500 to-red-600 text-[#EAF2FF] shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md active:shadow-sm border border-red-600/20"
  }
  
  const sizes = {
    sm: "btn-sm h-8 px-3 text-sm gap-1.5",
    base: "btn-base h-10 px-4 text-sm gap-2", 
    lg: "btn-lg h-12 px-6 text-base gap-2",
    xl: "btn-xl h-14 px-8 text-lg gap-3"
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isPressed && "transform scale-[0.98]",
        className
      )}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Content */}
      <div className={cn("flex items-center gap-2", loading && "invisible")}>
        {leftIcon && (
          <span className="flex-shrink-0 w-4 h-4">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="flex-shrink-0 w-4 h-4">
            {rightIcon}
          </span>
        )}
      </div>
      
      {/* Shine effect on hover */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }