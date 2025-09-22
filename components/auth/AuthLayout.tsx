'use client';

import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/nextjs';
import Logo from '@/components/ui/Logo';
import Link from 'next/link';

type AuthMode = 'sign-in' | 'sign-up';

interface AuthLayoutProps {
  defaultMode?: AuthMode;
}

export default function AuthLayout({ defaultMode = 'sign-in' }: AuthLayoutProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const toggleMode = () => {
    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (Static) */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: 'url(/zignals_login_wallpaper.png)',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0577DA]/80 via-[#1199FA]/70 to-[#33E1DA]/60"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo
                size="xl"
                showText={false}
                enableAnimations={true}
                asLink={true}
                href="/"
                className="scale-150"
              />
            </div>

            {/* Dynamic Welcome Message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold">
                {mode === 'sign-in' ? 'Welcome Back' : 'Join Zignal'}
              </h1>
              <p className="text-xl lg:text-2xl font-light opacity-90">
                {mode === 'sign-in'
                  ? 'Access your trading signals'
                  : 'Start your trading journey'
                }
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 text-left max-w-md">
              {mode === 'sign-in' ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">Real-time trading signals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">Advanced portfolio analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">24/7 market monitoring</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">Expert trading signals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">Professional analytics tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#33E1DA] rounded-full"></div>
                    <span className="text-lg">Secure trading environment</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form (Dynamic) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo
              size="lg"
              showText={false}
              enableAnimations={true}
              asLink={true}
              href="/"
            />
          </div>

          {/* Auth Form */}
          <div className="transition-all duration-300 ease-in-out">
{mode === 'sign-in' ? (
              <SignIn
                routing="virtual"
                afterSignInUrl="/"
                signUpUrl="/sign-up"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg w-full p-6',
                    headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
                    headerSubtitle: 'text-gray-600 dark:text-gray-300',
                    socialButtonsBlockButton:
                      'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800',
                    socialButtonsBlockButtonText: 'text-gray-900 dark:text-white font-medium',
                    formButtonPrimary:
                      'bg-[#0577DA] hover:bg-[#0466c4] text-white font-medium',
                    formFieldInput:
                      'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 bg-white',
                    formFieldLabel: 'text-gray-900 dark:text-white font-medium',
                    footerActionLink:
                      'text-[#0577DA] hover:text-[#0466c4] dark:text-[#1199FA] dark:hover:text-[#33E1DA] font-medium',
                    footerActionText: 'text-gray-600 dark:text-gray-300',
                    identityPreviewText: 'text-gray-900 dark:text-gray-100',
                    identityPreviewEditButton: 'text-[#0577DA] dark:text-[#1199FA]',
                    formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-300',
                    alternativeMethodsBlockButton: 'text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                    otpCodeFieldInput: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700',
                    formResendCodeLink: 'text-[#0577DA] dark:text-[#1199FA] font-medium',
                    main: 'text-gray-900 dark:text-white',
                    dividerText: 'text-gray-500 dark:text-gray-400',
                    dividerLine: 'bg-gray-300 dark:bg-gray-600',
                  },
                }}
              />
            ) : (
              <SignUp
                routing="virtual"
                afterSignUpUrl="/"
                signInUrl="/sign-in"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg w-full p-6',
                    headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
                    headerSubtitle: 'text-gray-600 dark:text-gray-300',
                    socialButtonsBlockButton:
                      'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800',
                    socialButtonsBlockButtonText: 'text-gray-900 dark:text-white font-medium',
                    formButtonPrimary:
                      'bg-[#0577DA] hover:bg-[#0466c4] text-white font-medium',
                    formFieldInput:
                      'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 bg-white',
                    formFieldLabel: 'text-gray-900 dark:text-white font-medium',
                    footerActionLink:
                      'text-[#0577DA] hover:text-[#0466c4] dark:text-[#1199FA] dark:hover:text-[#33E1DA] font-medium',
                    footerActionText: 'text-gray-600 dark:text-gray-300',
                    identityPreviewText: 'text-gray-900 dark:text-gray-100',
                    identityPreviewEditButton: 'text-[#0577DA] dark:text-[#1199FA]',
                    formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-300',
                    alternativeMethodsBlockButton: 'text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                    otpCodeFieldInput: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700',
                    formResendCodeLink: 'text-[#0577DA] dark:text-[#1199FA] font-medium',
                    main: 'text-gray-900 dark:text-white',
                    dividerText: 'text-gray-500 dark:text-gray-400',
                    dividerLine: 'bg-gray-300 dark:bg-gray-600',
                  },
                }}
              />
            )}
          </div>

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'sign-in'
                ? "Don't have an account? "
                : "Already have an account? "
              }
              <button
                onClick={toggleMode}
                className="text-[#0577DA] hover:text-[#0466c4] dark:text-[#1199FA] dark:hover:text-[#33E1DA] font-medium transition-colors"
              >
                {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}