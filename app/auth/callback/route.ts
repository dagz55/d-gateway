import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/dashboard"

  // Handle OAuth errors (like bad_oauth_state) more gracefully
  if (error) {
    // Don't log expected OAuth flow errors
    if (error === 'invalid_request' && errorDescription?.includes('bad_oauth_state')) {
      // This is a common error when users refresh or navigate back during OAuth
      // Just redirect to sign in without logging
      return NextResponse.redirect(`${origin}/`)
    }
    
    // Log other unexpected errors
    console.warn(`OAuth error: ${error} - ${errorDescription}`)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }

  if (code) {
    const supabase = await createServerSupabaseClient()

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError && data.session) {
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        // Check if this is a password recovery session
        const session = data.session
        if (session && session.user && session.user.email_confirmed_at && 
            searchParams.get('type') === 'recovery') {
          // This is a password reset session, redirect to reset password page
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }

        // Normal sign-in flow
        if (isLocalEnv) {
          // In development, redirect to localhost
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          // In production, use the forwarded host
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          // Fallback to origin
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        // Log session exchange errors
        console.error("Session exchange error:", exchangeError)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
