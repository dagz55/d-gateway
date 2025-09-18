"use client"

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Container Component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  children: React.ReactNode
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  size = 'xl',
  children,
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: 'max-w-screen-sm',      // 640px
    md: 'max-w-screen-md',      // 768px
    lg: 'max-w-screen-lg',      // 1024px
    xl: 'max-w-screen-xl',      // 1280px
    '2xl': 'max-w-screen-2xl',  // 1536px
    full: 'max-w-none'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Container.displayName = 'Container'

// Grid Component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'sm' | 'base' | 'lg' | 'xl'
  children: React.ReactNode
}

const Grid = forwardRef<HTMLDivElement, GridProps>(({
  cols = 1,
  gap = 'base',
  children,
  className,
  ...props
}, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12'
  }
  
  const gaps = {
    none: 'gap-0',
    sm: 'gap-4',
    base: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        gridCols[cols],
        gaps[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Grid.displayName = 'Grid'

// Stack Component (Vertical Layout)
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  children: React.ReactNode
}

const Stack = forwardRef<HTMLDivElement, StackProps>(({
  spacing = 'base',
  align = 'stretch',
  children,
  className,
  ...props
}, ref) => {
  const spacings = {
    none: 'space-y-0',
    xs: 'space-y-2',
    sm: 'space-y-3',
    base: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12'
  }
  
  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col',
        spacings[spacing],
        alignments[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Stack.displayName = 'Stack'

// Flex Component (Horizontal Layout)
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 'none' | 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  wrap?: boolean
  children: React.ReactNode
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(({
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 'base',
  wrap = false,
  children,
  className,
  ...props
}, ref) => {
  const directions = {
    row: 'flex-row',
    col: 'flex-col'
  }
  
  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }
  
  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }
  
  const gaps = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    base: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        directions[direction],
        alignments[align],
        justifications[justify],
        gaps[gap],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Flex.displayName = 'Flex'

// Section Component
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'base' | 'lg' | 'xl'
  background?: 'none' | 'subtle' | 'muted' | 'elevated'
  children: React.ReactNode
}

const Section = forwardRef<HTMLElement, SectionProps>(({
  size = 'base',
  background = 'none',
  children,
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: 'py-12 sm:py-16',
    base: 'py-16 sm:py-20',
    lg: 'py-20 sm:py-24',
    xl: 'py-24 sm:py-32'
  }
  
  const backgrounds = {
    none: '',
    subtle: 'bg-neutral-50/50',
    muted: 'bg-neutral-50',
    elevated: 'bg-enhanced-card shadow-sm border-y border-border'
  }

  return (
    <section
      ref={ref}
      className={cn(
        sizes[size],
        backgrounds[background],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
})
Section.displayName = 'Section'

// Spacer Component
interface SpacerProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
}

const Spacer = ({ size = 'base' }: SpacerProps) => {
  const sizes = {
    xs: 'h-2',
    sm: 'h-4',
    base: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
    '3xl': 'h-24'
  }

  return <div className={sizes[size]} />
}

export { Container, Grid, Stack, Flex, Section, Spacer }