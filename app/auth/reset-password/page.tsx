"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [validToken, setValidToken] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a valid session from the password reset link
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session check error:", error)
          setError("Invalid or expired reset link. Please request a new one.")
          setValidToken(false)
        } else if (session) {
          setValidToken(true)
        } else {
          setError("No valid session found. Please click the reset link from your email.")
          setValidToken(false)
        }
      } catch (error) {
        console.error("Session validation error:", error)
        setError("Failed to validate reset link. Please try again.")
        setValidToken(false)
      } finally {
        setValidatingToken(false)
      }
    }

    checkSession()
  }, [])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password update error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass glass-hover border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="mt-4 text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass glass-hover border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass glass-hover border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Password Updated!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
            </div>

            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Go to Dashboard
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                Sign In Again
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass glass-hover border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-accent focus:ring-accent pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-accent focus:ring-accent pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2 text-sm">
                Password Requirements:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={password.length >= 8 ? "text-green-400" : ""}>
                  • At least 8 characters long
                </li>
                <li className={/(?=.*[a-z])/.test(password) ? "text-green-400" : ""}>
                  • One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(password) ? "text-green-400" : ""}>
                  • One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(password) ? "text-green-400" : ""}>
                  • One number
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium h-12"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}