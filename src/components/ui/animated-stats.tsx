'use client';

import { cn } from '@/lib/utils';
import { motion, useAnimationControls, useInView } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  format = 'number'
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const controls = useAnimationControls();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (inView) {
      controls.start({
        from: 0,
        to: value,
        transition: { duration, ease: 'easeOut' },
        onUpdate: (latest) => {
          if (typeof latest === 'number') {
            setDisplayValue(latest);
          }
        }
      });
    }
  }, [inView, value, duration, controls]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(val);
      case 'percentage':
        return `${val.toFixed(decimals)}%`;
      default:
        return val.toFixed(decimals);
    }
  };

  return (
    <motion.span
      ref={ref}
      animate={controls}
      className={cn('tabular-nums', className)}
    >
      {prefix}{formatValue(displayValue)}{suffix}
    </motion.span>
  );
};

interface AnimatedStatCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: 'currency' | 'percentage' | 'number';
  decimals?: number;
  className?: string;
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  title,
  value,
  change,
  changeLabel = '24h change',
  icon,
  format = 'number',
  decimals = 0,
  className,
  delay = 0,
  trend = 'neutral'
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }[trend];

  const trendBg = {
    up: 'bg-green-50 dark:bg-green-950/20',
    down: 'bg-red-50 dark:bg-red-950/20',
    neutral: 'bg-gray-50 dark:bg-gray-950/20'
  }[trend];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm',
        'hover:shadow-md transition-shadow duration-300',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="text-muted-foreground"
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="text-2xl font-bold"
        >
          <AnimatedNumber 
            value={value} 
            format={format} 
            decimals={decimals}
            duration={1.5}
          />
        </motion.div>
        
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, delay: delay + 0.4 }}
            className={cn(
              'mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit',
              trendBg
            )}
          >
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {trend === 'up' && '↗'}
              {trend === 'down' && '↘'}
              {trend === 'neutral' && '→'}
            </motion.span>
            <span className={trendColor}>
              {change > 0 && '+'}{change}
              {format === 'percentage' && '%'}
              {format === 'currency' && ''}
            </span>
            <span className="text-muted-foreground text-xs">
              {changeLabel}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Animated border effect */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-xl"
        whileHover={{
          borderColor: trend === 'up' ? 'rgba(34, 197, 94, 0.3)' : 
                      trend === 'down' ? 'rgba(239, 68, 68, 0.3)' : 
                      'rgba(59, 130, 246, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showValue?: boolean;
  animated?: boolean;
  height?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  color = 'bg-blue-500',
  showValue = false,
  animated = true,
  height = 'md',
  pulse = false
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const percentage = Math.min((value / max) * 100, 100);

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[height];

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        heightClasses
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            color,
            pulse && 'animate-pulse'
          )}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ 
            duration: animated ? 1.5 : 0,
            ease: 'easeOut',
            delay: 0.2
          }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'linear'
              }}
            />
          )}
        </motion.div>
      </div>
      
      {showValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="absolute -top-8 right-0 text-sm font-medium"
        >
          <AnimatedNumber 
            value={percentage} 
            suffix="%" 
            decimals={1}
            duration={1.5}
          />
        </motion.div>
      )}
    </div>
  );
};