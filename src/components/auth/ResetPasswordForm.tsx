'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
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

type EmailFormData = z.infer<typeof emailSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const supabase = createClient();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const { register, handleSubmit, formState: { errors }, watch } = emailForm;
  const email = watch('email');

  const onRequestReset = async (data: EmailFormData) => {
    console.log('🚀 Send Reset Link clicked!', data);
    setIsLoading(true);
    setButtonState('loading');
    
    try {
      // Get the current origin for the redirect URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/reset-password/confirm`;

      // Use Supabase Auth to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        setButtonState('error');
        
        // Handle specific error cases
        if (error.message.includes('not found') || error.status === 404) {
          // Don't reveal if email exists or not for security
          toast.success('If an account exists with this email, you will receive a password reset link.', {
            description: 'Please check your email for the reset link',
            duration: 6000,
          });
          setButtonState('success');
          setEmailSent(true);
        } else {
          toast.error('Failed to send reset link', {
            description: error.message || 'Please try again later',
            duration: 5000,
          });
        }
      } else {
        // Success - email sent via Supabase
        setButtonState('success');
        setEmailSent(true);
        toast.success('Password reset link sent!', {
          description: 'If an account exists with this email, you will receive a password reset link.',
          duration: 6000,
        });
      }
      
      // Reset button state after animation
      setTimeout(() => setButtonState('idle'), 2000);
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onRequestReset)} className="space-y-4">
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
              {emailSent && (
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
