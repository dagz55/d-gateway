import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, just continue without auth checks
    return NextResponse.next()
  }

  // Additional validation to prevent HTML responses
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('Invalid Supabase URL format in middleware:', supabaseUrl)
    return NextResponse.next()
  }

  // Check header size to prevent REQUEST_HEADER_TOO_LARGE errors
  const headersSize = JSON.stringify(request.headers).length
  if (headersSize > 30000) { // Leave some buffer below 32KB limit
    console.warn('Request headers too large, redirecting to clean state:', headersSize)
    return NextResponse.redirect(new URL('/auth/clean-session', request.url))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Filter and limit cookie size to prevent header overflow
        const filteredCookies = cookiesToSet.filter(({ name, value }) => {
          // Skip very large cookies that might cause header overflow
          if (value.length > 4000) { // 4KB per cookie limit
            console.warn(`Skipping large cookie: ${name} (${value.length} bytes)`)
            return false
          }
          return true
        })

        filteredCookies.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        filteredCookies.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // If there's an auth error, handle it appropriately
    if (error) {
      // Only log non-session-related errors
      if (!error.message.includes('session') && !error.message.includes('missing')) {
        console.warn('Supabase auth error in middleware:', error.message)
      }
      return supabaseResponse
    }

    // If user is signed in and the current path is / redirect the user to /dashboard
    if (user && request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Handle different types of errors gracefully
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Define patterns for expected/ignorable errors
      const ignorablePatterns = [
        'fetch failed',
        'network',
        'timeout', 
        'unexpected token',
        'not valid json',
        'auth session missing',
        'session missing',
        'invalid json',
        'html',
        'bad_oauth_state',
        'invalid_request'
      ]
      
      // Skip logging for common, expected errors
      if (ignorablePatterns.some(pattern => errorMessage.includes(pattern))) {
        // These are typically network/connectivity/session issues, don't log them
        return supabaseResponse
      }
      
      // Only log truly unexpected errors
      console.warn('Unexpected Supabase error in middleware:', error.message)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
