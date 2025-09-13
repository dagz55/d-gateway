'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  hover?: boolean;
  glowEffect?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, delay = 0, direction = 'up', hover = true, glowEffect = false, ...props }, ref) => {
    const directionVariants = {
      up: { y: 20, opacity: 0 },
      down: { y: -20, opacity: 0 },
      left: { x: 20, opacity: 0 },
      right: { x: -20, opacity: 0 }
    };

    return (
      <motion.div
        ref={ref}
        initial={directionVariants[direction]}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.4, 0, 0.2, 1]
        }}
        whileHover={hover ? { 
          y: -8, 
          scale: 1.02,
          boxShadow: glowEffect 
            ? '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.3)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        } : undefined}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'transform-gpu',
          glowEffect && 'ring-1 ring-blue-500/20',
          className
        )}
        {...props}
      >
        <Card className="h-full border-0 shadow-lg">
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

interface AnimatedCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedCardHeader: React.FC<AnimatedCardHeaderProps> = ({ children, className }) => (
  <CardHeader className={cn('pb-4', className)}>
    {children}
  </CardHeader>
);

interface AnimatedCardTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const AnimatedCardTitle: React.FC<AnimatedCardTitleProps> = ({ children, className, icon }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    <CardTitle className={cn('flex items-center gap-2', className)}>
      {icon && (
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </CardTitle>
  </motion.div>
);

interface AnimatedCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedCardDescription: React.FC<AnimatedCardDescriptionProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <CardDescription className={className}>
      {children}
    </CardDescription>
  </motion.div>
);

interface AnimatedCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedCardContent: React.FC<AnimatedCardContentProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <CardContent className={className}>
      {children}
    </CardContent>
  </motion.div>
);