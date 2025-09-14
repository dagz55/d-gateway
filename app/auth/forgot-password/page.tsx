"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password reset error:", error)
    } finally {
      setLoading(false)
    }
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
              Check Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to:
              </p>
              <p className="font-medium text-accent">{email}</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Next steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check your email inbox and spam folder</li>
                <li>• Click the password reset link</li>
                <li>• Enter your new password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                  setError(null)
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
              
              <Button asChild className="w-full" variant="ghost">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
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
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No worries! Enter your email and we'll send you a reset link
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
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border focus:border-accent focus:ring-accent"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium h-12"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="text-center">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-2 text-sm">
              Having trouble?
            </h4>
            <p className="text-xs text-muted-foreground">
              If you don't receive an email within a few minutes, check your spam folder or{" "}
              <Link href="/support" className="text-accent hover:text-accent/80 underline">
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}