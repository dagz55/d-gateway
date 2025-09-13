'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [password, setPassword] = useState('');

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const calculateStrength = (pass: string): number => {
      let strength = 0;
      if (pass.length >= 8) strength++;
      if (pass.length >= 12) strength++;
      if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
      if (/\d/.test(pass)) strength++;
      if (/[^a-zA-Z\d]/.test(pass)) strength++;
      return Math.min(strength, 4);
    };

    const getStrengthColor = (strength: number) => {
      switch (strength) {
        case 0:
        case 1:
          return 'bg-red-500';
        case 2:
          return 'bg-orange-500';
        case 3:
          return 'bg-yellow-500';
        case 4:
          return 'bg-green-500';
        default:
          return 'bg-gray-300';
      }
    };

    const getStrengthText = (strength: number) => {
      switch (strength) {
        case 0:
          return 'Very Weak';
        case 1:
          return 'Weak';
        case 2:
          return 'Fair';
        case 3:
          return 'Good';
        case 4:
          return 'Strong';
        default:
          return '';
      }
    };

    const strength = calculateStrength(password);

    return (
      <div className="relative">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              isFocused && 'border-primary',
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setPassword(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={cn(
              'absolute right-0 top-0 h-10 px-3 py-2 hover:bg-transparent transition-all duration-200',
              'text-muted-foreground hover:text-foreground',
              'focus:outline-none focus:text-foreground'
            )}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <div className="relative w-5 h-5">
              <Eye
                className={cn(
                  'absolute inset-0 w-5 h-5 transition-all duration-300',
                  showPassword ? 'opacity-0 scale-75 rotate-180' : 'opacity-100 scale-100 rotate-0'
                )}
              />
              <EyeOff
                className={cn(
                  'absolute inset-0 w-5 h-5 transition-all duration-300',
                  showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-180'
                )}
              />
            </div>
          </button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-500',
                    index < strength ? getStrengthColor(strength) : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>
            <p className={cn(
              'text-xs transition-all duration-300',
              strength <= 1 ? 'text-red-500' : 
              strength === 2 ? 'text-orange-500' :
              strength === 3 ? 'text-yellow-500' :
              'text-green-500'
            )}>
              Password strength: {getStrengthText(strength)}
            </p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };