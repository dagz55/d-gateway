"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ExternalLink, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/browserClient"
import { TermsModal, PrivacyModal, SupportModal } from "@/components/modals"

export function AuthCard() {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Please add your Supabase environment variables.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error("[v0] Google sign-in error:", error)
        setError("Failed to sign in with Google. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Google sign-in error:", error)
      setError("Supabase is not configured. Please add your environment variables.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Please add your Supabase environment variables.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isSignUp && formData.password !== formData.confirmPassword) {
        setError("Passwords don't match")
        return
      }

      if (isSignUp) {
        const { data, error } = await supabase().auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        })

        if (error) {
          console.error("[v0] Sign up error:", error)
          setError(error.message)
        } else if (data.user && !data.session) {
          setError("Please check your email for a confirmation link.")
        }
      } else {
        const { data, error } = await supabase().auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          console.error("[v0] Sign in error:", error)
          setError(error.message)
        } else if (data.session) {
          // Redirect to dashboard on successful sign in
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      console.error("[v0] Email auth error:", error)
      setError("Supabase is not configured. Please add your environment variables.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md glass glass-hover border-[#33E1DA]/20 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-[#EAF2FF]">
          {showEmailForm ? (isSignUp ? "Create Account" : "Sign In") : "Welcome to Zignal"}
        </CardTitle>
        <CardDescription className="text-[#EAF2FF]/70">
          {showEmailForm
            ? isSignUp
              ? "Create your account to get started"
              : "Sign in to your account"
            : "Access your trading dashboard"}
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

        {/* Supabase Configuration Warning */}
        {!isSupabaseConfigured && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <div className="text-sm text-yellow-400">
              <p className="font-medium">Supabase Not Configured</p>
              <p>Add your Supabase environment variables in Project Settings to enable authentication.</p>
            </div>
          </div>
        )}

        {!showEmailForm ? (
          <>
            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || !isSupabaseConfigured}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 font-medium border-0 focus:ring-2 focus:ring-[#33E1DA] transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77C17.45 20.53 14.97 23 12 23 7.7 23 3.99 20.53 2.18 16.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#33E1DA]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1E2A44] px-2 text-[#EAF2FF]/60">or</span>
              </div>
            </div>

            {/* Email Toggle Button */}
            <Button
              variant="ghost"
              onClick={() => setShowEmailForm(true)}
              disabled={!isSupabaseConfigured}
              className="w-full text-[#33E1DA] hover:text-[#33E1DA]/80 hover:bg-[#33E1DA]/10 disabled:opacity-50"
            >
              Use email instead
            </Button>
          </>
        ) : (
          <>
            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#EAF2FF]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!isSupabaseConfigured}
                  className="bg-[#1E2A44]/50 border-[#33E1DA]/30 text-[#EAF2FF] placeholder:text-[#EAF2FF]/50 focus:border-[#33E1DA] focus:ring-[#33E1DA] disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#EAF2FF]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={!isSupabaseConfigured}
                    className="bg-[#1E2A44]/50 border-[#33E1DA]/30 text-[#EAF2FF] placeholder:text-[#EAF2FF]/50 focus:border-[#33E1DA] focus:ring-[#33E1DA] pr-10 disabled:opacity-50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!isSupabaseConfigured}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#EAF2FF]/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#EAF2FF]/50" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link - only show for sign in */}
              {!isSignUp && (
                <div className="flex justify-end">
                  <Link 
                    href="/auth/forgot-password"
                    className="text-xs text-[#33E1DA] hover:text-[#33E1DA]/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#EAF2FF]">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={!isSupabaseConfigured}
                    className="bg-[#1E2A44]/50 border-[#33E1DA]/30 text-[#EAF2FF] placeholder:text-[#EAF2FF]/50 focus:border-[#33E1DA] focus:ring-[#33E1DA] disabled:opacity-50"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="w-full bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90 text-white font-medium h-12 focus:ring-2 focus:ring-[#33E1DA] disabled:opacity-50"
              >
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={!isSupabaseConfigured}
                className="text-[#33E1DA] hover:text-[#33E1DA]/80 hover:bg-[#33E1DA]/10 disabled:opacity-50"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowEmailForm(false)}
              className="w-full text-[#EAF2FF]/60 hover:text-[#EAF2FF] hover:bg-[#33E1DA]/10"
            >
              ← Back to Google Sign-In
            </Button>
          </>
        )}

        <Separator className="bg-[#33E1DA]/20" />

        {/* Dashboard Links */}
        <div className="space-y-2">
          <div className="text-sm text-[#EAF2FF]/60 text-center mb-3">Quick Access (Sign in required)</div>

          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="group relative">
              <Button
                variant="outline"
                disabled
                className="w-full border-[#33E1DA]/30 text-[#EAF2FF]/50 hover:border-[#33E1DA]/50 hover:text-[#EAF2FF] disabled:opacity-50 bg-transparent"
              >
                Member Dashboard
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1E2A44] text-[#EAF2FF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Sign in required
              </div>
            </Link>

            <Link href="/admin" className="group relative">
              <Button
                variant="outline"
                disabled
                className="w-full border-[#33E1DA]/30 text-[#EAF2FF]/50 hover:border-[#33E1DA]/50 hover:text-[#EAF2FF] disabled:opacity-50 bg-transparent"
              >
                Admin Panel
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1E2A44] text-[#EAF2FF] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Sign in required
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center space-x-4 text-xs text-[#EAF2FF]/50">
          <TermsModal>
            <button className="hover:text-[#33E1DA] transition-colors cursor-pointer">
              Terms
            </button>
          </TermsModal>
          <PrivacyModal>
            <button className="hover:text-[#33E1DA] transition-colors cursor-pointer">
              Privacy
            </button>
          </PrivacyModal>
          <SupportModal>
            <button className="hover:text-[#33E1DA] transition-colors cursor-pointer">
              Support
            </button>
          </SupportModal>
        </div>
      </CardContent>
    </Card>
  )
}
