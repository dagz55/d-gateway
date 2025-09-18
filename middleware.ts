import { NextResponse, type NextRequest } from 'next/server'

// Simple middleware without Node.js dependencies
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/clean-session',
    '/auth/auth-code-error',
    '/enterprise',
    '/api/auth/workos/login',
    '/api/auth/workos/callback',
    '/api/auth/workos/logout',
    '/api/auth/workos/me',
    '/api/auth/workos/refresh',
    '/api/auth/workos/profile',
    '/api/auth/workos/supabase-user',
  ]

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  // For protected routes, check if user has a session cookie
  if (!publicRoutes.includes(pathname) && !pathname.startsWith('/api/')) {
    const hasSession = request.cookies.has('wos-session')
    const hasAccessToken = request.cookies.has('access-token')
    
    if (!hasSession && !hasAccessToken) {
      // No session or token, redirect to home page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Add CSRF token header for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.cookies.get('csrf-token')?.value
    if (csrfToken) {
      response.headers.set('X-CSRF-Token', csrfToken)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}