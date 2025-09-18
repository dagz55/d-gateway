"use client"

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive'
  padding?: 'none' | 'sm' | 'base' | 'lg' | 'xl'
  hover?: boolean
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'base',
  hover = false,
  children,
  className,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyles = "card relative rounded-xl transition-all duration-300 ease-swift overflow-hidden"
  
  const variants = {
    default: "bg-[#1E2A44]/40 border border-[#33E1DA]/20 shadow-sm",
    elevated: "bg-[#1E2A44]/60 border border-[#33E1DA]/30 shadow-lg",
    glass: "bg-[#1E2A44]/30 border border-[#33E1DA]/20 backdrop-blur-xl shadow-lg",
    interactive: "bg-[#1E2A44]/40 border border-[#33E1DA]/20 shadow-sm hover:shadow-lg hover:border-[#33E1DA]/50 hover:-translate-y-1 cursor-pointer"
  }
  
  const paddings = {
    none: "",
    sm: "p-4",
    base: "p-6",
    lg: "p-8", 
    xl: "p-10"
  }

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hover && variant !== 'interactive' && "hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Subtle glow effect */}
      {(variant === 'interactive' || hover) && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-brand-50/30 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shine effect for glass variant */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      )}
    </div>
  )
})

Card.displayName = 'Card'

// Card components
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-[#EAF2FF]", className)}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#EAF2FF]/70 leading-relaxed", className)}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    {...props}
  >
    {children}
  </div>
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  >
    {children}
  </div>
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }