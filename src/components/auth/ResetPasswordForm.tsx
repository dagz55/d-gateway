'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2, Mail, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema for email step
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Schema for OTP and password reset step
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors }, watch: watchEmail } = emailForm;
  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors }, watch: watchReset } = resetForm;

  const email = watchEmail('email');

  const onRequestOTP = async (data: EmailFormData) => {
    console.log('🚀 Send Reset Link clicked!', data);
    setIsLoading(true);
    setButtonState('loading');
    
    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (result.success) {
        setButtonState('success');
        setEmailSent(true);
        
        // Check if we're in development mode with OTP
        if (result.data.otp) {
          // Development mode with OTP
          setOtpCode(result.data.otp);
          setOtpSent(true);
          setStep('otp');
          toast.success(result.message || 'Development mode: OTP generated', {
            description: 'Check the form below for your OTP code',
            duration: 5000,
          });
          if (result.data.note) {
            toast.info(result.data.note, { duration: 4000 });
          }
        } else {
          // Production mode with email
          toast.success('Password reset link sent!', {
            description: 'Please check your email for the reset link',
            duration: 6000,
          });
        }
        
        // Reset button state after animation
        setTimeout(() => setButtonState('idle'), 2000);
      } else {
        setButtonState('error');
        // Show specific error message
        const errorMessage = result.message || 'Failed to send reset email';
        toast.error('Failed to send reset link', {
          description: errorMessage,
          duration: 5000,
        });
        
        // Reset button state
        setTimeout(() => setButtonState('idle'), 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setButtonState('error');
      toast.error('Connection error', {
        description: 'Please check your internet connection and try again',
        duration: 5000,
      });
      
      // Reset button state
      setTimeout(() => setButtonState('idle'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Password reset successful! You can now sign in.');
        // Reset form and go back to email step
        setStep('email');
        setOtpSent(false);
        setOtpCode('');
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit(onRequestOTP)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: buttonState === 'loading' ? 0.98 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden group"
                disabled={isLoading}
                variant={buttonState === 'success' ? 'default' : 'default'}
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  <AnimatePresence mode="wait">
                    {buttonState === 'loading' && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </motion.div>
                    )}
                    {buttonState === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                    {buttonState === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <span className="relative">
                    {buttonState === 'loading' ? 'Sending...' : 
                     buttonState === 'success' ? 'Sent!' : 
                     'Send Reset Link'}
                  </span>
                </motion.div>
                
                {/* Ripple effect on click */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-md"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={buttonState === 'loading' ? 
                    { scale: [0, 1.5], opacity: [0.3, 0] } : 
                    { scale: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>

            {/* Success message with animation */}
            <AnimatePresence>
              {emailSent && !otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div className="space-y-1">
                      <motion.p 
                        className="text-sm font-medium text-green-800 dark:text-green-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                      >
                        Email sent successfully!
                      </motion.p>
                      <motion.p 
                        className="text-sm text-green-700 dark:text-green-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.2 }}
                      >
                        Please check your inbox for the password reset link
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enter Reset Code</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
          {otpSent && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>OTP Code:</strong> {otpCode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This code is for development purposes only.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">Reset Code</Label>
            <Input
              id="otp"
              {...register('otp')}
              placeholder="123456"
              maxLength={6}
              disabled={isLoading}
            />
            {errors.otp && (
              <p className="text-sm text-destructive">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep('email')}
            disabled={isLoading}
          >
            Back to Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
