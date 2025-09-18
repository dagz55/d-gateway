'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { TermsModal, PrivacyModal } from '@/components/modals';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Shield, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion, MotionProps } from 'framer-motion';
import Link from 'next/link';

export function WorkOSAuthCard() {
  const { signInWithWorkOS, signInWithEmail, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Conditional animation props
  const cardAnimationProps: MotionProps = shouldReduceMotion 
    ? {} 
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, ease: "easeOut" }
      };

  const iconAnimationProps: MotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: { delay: 0.2, duration: 0.6, ease: "easeOut" }
      };

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsEmailSubmitting(true);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.success) {
        toast.error(result.error);
      }
      // The context will handle the redirect on successful login
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleWorkOSSignIn = () => {
    signInWithWorkOS();
  };

  return (
    <motion.div
      {...cardAnimationProps}
    >
      <Card className="w-full max-w-md glass glass-hover border-[#33E1DA]/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-[#0A1628]/90 to-[#1E2A44]/90 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/5 to-[#00B4A6]/5 animate-pulse" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#33E1DA]/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#00B4A6]/10 to-transparent rounded-full blur-xl" />
        
        <CardHeader className="space-y-6 text-center relative z-10">
          <motion.div 
            className="flex justify-center"
            {...iconAnimationProps}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#33E1DA] to-[#00B4A6] rounded-full flex items-center justify-center shadow-lg ring-4 ring-[#33E1DA]/20 relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-[#33E1DA] to-[#00B4A6] rounded-full opacity-20 ${shouldReduceMotion ? '' : 'animate-ping'}`} />
              <span className="text-3xl font-bold text-white relative z-10">Z</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-2"
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#33E1DA] to-[#00B4A6] bg-clip-text text-transparent">
              Welcome to Zignal
            </CardTitle>
            <CardDescription className="text-[#EAF2FF]/70 text-base">
              Professional Trading Signals & Analytics Platform
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* WorkOS Sign In Button */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleWorkOSSignIn}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-[#33E1DA] to-[#00B4A6] hover:from-[#2BC4B8] hover:to-[#009B8E] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#33E1DA]/25 hover:shadow-2xl border-0 relative overflow-hidden group"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#33E1DA]/20 to-[#00B4A6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    <span>Authenticating...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center relative z-10"
                  >
                    <Shield className="w-5 h-5 mr-3" />
                    <span>Sign in with WorkOS</span>
                    <Zap className="w-4 h-4 ml-2 opacity-70" />
                  </motion.div>
                )}
              </Button>
            </motion.div>

            <motion.div 
              className="text-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <p className="text-sm text-[#EAF2FF]/80 font-medium">
                Enterprise-grade authentication
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-[#33E1DA]/80">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="w-1 h-1 bg-[#33E1DA]/40 rounded-full" />
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Professional</span>
                </div>
                <div className="w-1 h-1 bg-[#33E1DA]/40 rounded-full" />
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Compliant</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Separator className="my-8 bg-gradient-to-r from-transparent via-[#33E1DA]/30 to-transparent" />
          </motion.div>

          {/* Email/Password Form */}
          <motion.form 
            onSubmit={handleEmailSignIn} 
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#EAF2FF]/90 font-medium">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@zignal.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#EAF2FF]/90 font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#33E1DA]/60 hover:text-[#33E1DA] transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                </div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:shadow-xl border-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {isEmailSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center relative z-10"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center relative z-10"
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span>Sign In with Email</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <Separator className="my-8 bg-gradient-to-r from-transparent via-[#33E1DA]/30 to-transparent" />
          </motion.div>

          {/* Features */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <h4 className="text-sm font-semibold text-[#EAF2FF]/90 text-center">
              Why Choose WorkOS Authentication?
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-[#EAF2FF]/80">
              <motion.div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#33E1DA]/5 border border-[#33E1DA]/20"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 225, 218, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse"></div>
                <span className="font-medium">Enterprise Security</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#33E1DA]/5 border border-[#33E1DA]/20"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 225, 218, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse"></div>
                <span className="font-medium">SOC 2 Compliant</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#33E1DA]/5 border border-[#33E1DA]/20"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 225, 218, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse"></div>
                <span className="font-medium">Advanced SSO</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#33E1DA]/5 border border-[#33E1DA]/20"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 225, 218, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse"></div>
                <span className="font-medium">Audit Trails</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Auth Links */}
          <motion.div 
            className="flex justify-between items-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="ghost" size="sm" className="text-[#33E1DA]/80 hover:text-[#33E1DA] hover:bg-[#33E1DA]/10 p-0 h-auto font-normal">
                <Link href="/auth/forgot-password">
                  Forgot password?
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="ghost" size="sm" className="text-[#33E1DA]/80 hover:text-[#33E1DA] hover:bg-[#33E1DA]/10 p-0 h-auto font-normal">
                <Link href="/auth/signup">
                  Create account
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <p className="text-xs text-[#EAF2FF]/60 leading-relaxed">
              By signing in, you agree to our{' '}
              <TermsModal>
                <motion.button 
                  className="text-[#33E1DA] hover:text-[#2BC4B8] cursor-pointer font-medium underline decoration-transparent hover:decoration-current transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  Terms of Service
                </motion.button>
              </TermsModal>{' '}
              and{' '}
              <PrivacyModal>
                <motion.button 
                  className="text-[#33E1DA] hover:text-[#2BC4B8] cursor-pointer font-medium underline decoration-transparent hover:decoration-current transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  Privacy Policy
                </motion.button>
              </PrivacyModal>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
