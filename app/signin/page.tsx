'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function CustomSignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For now, just simulate authentication
      console.log('Sign in attempt:', formData);
      
      // Add your authentication logic here
      // This could be Clerk, Supabase, or any other auth provider
      
      setError('Authentication not implemented yet - this is just the UI');
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Wallpaper */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 relative">
        <Image
          src="/zignals_login_wallpaper.png"
          alt="Zignals Trading Platform"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay with branding */}
        <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Zignals</h1>
            <p className="text-xl opacity-90">
              Professional trading signals and market insights
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Logo for all screens */}
          <div className="mb-8 text-center">
            <div className="inline-block">
              <Logo
                size="xl"
                enableAnimations={true}
                asLink={true}
                href="/"
                showText={false}
                className="justify-center"
              />
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Professional Trading Platform
                </h2>
              </div>
            </div>
          </div>
          
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Access your trading dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#33E1DA] focus:border-transparent"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 rounded-lg py-3 px-4 pr-12 focus:ring-2 focus:ring-[#33E1DA] focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#33E1DA] hover:bg-[#2BC4BE] text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gradient-to-r hover:from-[#4285F4] hover:via-[#EA4335] hover:to-[#FBBC05] hover:text-white text-gray-900 dark:text-white rounded-lg py-3 px-4 font-medium transition-all duration-300"
                  onClick={() => setError('Google sign-in not implemented yet')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Don't have an account?{' '}
                </span>
                <Link 
                  href="/signup" 
                  className="text-[#33E1DA] hover:text-[#2BC4BE] font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
