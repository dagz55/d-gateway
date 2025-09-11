'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glow' | 'gradient' | 'pulse';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  ripple?: boolean;
  glow?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false, 
    ripple = true,
    glow = false,
    onClick,
    disabled,
    type = 'button',
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Create ripple effect
      if (ripple) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const newRipple = { id: Date.now(), x, y };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }

      onClick?.();
    };

    const baseVariants = {
      initial: { scale: 1 },
      hover: { 
        scale: 1.05,
        transition: { duration: 0.2 }
      },
      tap: { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }
    };

    const glowVariants = {
      initial: { 
        boxShadow: '0 0 0 rgba(59, 130, 246, 0)'
      },
      hover: {
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
        transition: { duration: 0.3 }
      }
    };

    const pulseVariants = {
      animate: {
        scale: [1, 1.02, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    };

    const gradientClass = variant === 'gradient' 
      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600'
      : '';

    const glowClass = variant === 'glow' || glow
      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/75'
      : '';

    const pulseClass = variant === 'pulse'
      ? 'bg-green-500 text-white animate-pulse'
      : '';

    return (
      <motion.div
        className="relative inline-block"
        variants={variant === 'pulse' ? pulseVariants : baseVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={variant === 'pulse' ? 'animate' : undefined}
      >
        {(variant === 'glow' || glow) && (
          <motion.div
            className="absolute inset-0 rounded-md"
            variants={glowVariants}
            initial="initial"
            whileHover="hover"
          />
        )}
        
        <Button
          ref={ref}
          type={type}
          onClick={handleClick}
          disabled={disabled || loading}
          size={size}
          variant={variant === 'glow' || variant === 'gradient' || variant === 'pulse' ? 'default' : variant}
          className={cn(
            'relative overflow-hidden transform-gpu',
            gradientClass,
            glowClass,
            pulseClass,
            loading && 'cursor-not-allowed opacity-70',
            className
          )}
          {...props}
        >
          {loading && (
            <motion.div
              className="absolute inset-0 bg-current opacity-20"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
          
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full bg-current opacity-30 pointer-events-none"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
          
          <motion.span
            className="relative z-10 flex items-center gap-2"
            animate={loading ? { opacity: [1, 0.5, 1] } : undefined}
            transition={loading ? { duration: 1, repeat: Infinity } : undefined}
          >
            {loading && (
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {children}
          </motion.span>
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';