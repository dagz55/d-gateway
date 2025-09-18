"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.password || !formData.confirmPassword || !formData.fullName.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign up error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3] flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass border-[#33E1DA]/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#33E1DA] to-[#00B4A6] rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-[#EAF2FF]">Check Your Email</CardTitle>
            <CardDescription className="text-[#EAF2FF]/70">
              We've sent a verification link to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#33E1DA]/10 border border-[#33E1DA]/20 rounded-lg">
              <p className="text-sm text-[#EAF2FF]/80 text-center">
                Please check your email and click the verification link to complete your account setup.
              </p>
            </div>

            <div className="text-center">
              <Button asChild variant="ghost" className="text-[#33E1DA] hover:text-[#2BC4B8] hover:bg-[#33E1DA]/10">
                <Link href="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-xs text-[#EAF2FF]/60 text-center">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/5 to-[#00B4A6]/5 animate-pulse" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#33E1DA]/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#00B4A6]/10 to-transparent rounded-full blur-xl" />
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/auth"
          className="px-4 py-2 bg-[#1E2A44]/80 text-[#EAF2FF] rounded-lg hover:bg-[#33E1DA] hover:text-[#0A0F1F] transition-all duration-300"
        >
          ← Back to Sign In
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="w-full max-w-md glass border-[#33E1DA]/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-[#0A1628]/90 to-[#1E2A44]/90 relative overflow-hidden">
            <CardHeader className="space-y-4 text-center relative z-10">
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#33E1DA] to-[#00B4A6] rounded-full flex items-center justify-center shadow-lg ring-4 ring-[#33E1DA]/20">
                  <span className="text-2xl font-bold text-white">Z</span>
                </div>
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#33E1DA] to-[#00B4A6] bg-clip-text text-transparent">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-[#EAF2FF]/70">
                  Join the professional trading signals platform
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[#EAF2FF]/90 font-medium">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="pl-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#EAF2FF]/90 font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#EAF2FF]/90 font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200"
                      disabled={loading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#33E1DA]/60 hover:text-[#33E1DA] transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#EAF2FF]/90 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#33E1DA]/60 group-focus-within:text-[#33E1DA] transition-colors duration-200" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-12 h-12 bg-[#1E2A44]/60 border-[#33E1DA]/30 text-white placeholder:text-[#EAF2FF]/40 focus:border-[#33E1DA] focus:ring-2 focus:ring-[#33E1DA]/20 rounded-xl transition-all duration-200"
                      disabled={loading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#33E1DA]/60 hover:text-[#33E1DA] transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#33E1DA] to-[#00B4A6] hover:from-[#2BC4B8] hover:to-[#009B8E] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#33E1DA]/25 hover:shadow-2xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                        />
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="text-center">
                <p className="text-sm text-[#EAF2FF]/60">
                  Already have an account?{" "}
                  <Link 
                    href="/auth" 
                    className="text-[#33E1DA] hover:text-[#2BC4B8] font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              <div className="p-4 bg-[#33E1DA]/5 border border-[#33E1DA]/20 rounded-lg">
                <p className="text-xs text-[#EAF2FF]/70 text-center leading-relaxed">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
