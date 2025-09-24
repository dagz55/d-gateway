import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Validate required environment variables
const validateEnvironment = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please configure these variables in Vercel dashboard: Settings → Environment Variables');
  }
};

// Validate environment on middleware load
validateEnvironment();

// Public routes that are accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/market",
  "/enterprise",
  "/help",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Legacy aliases that we redirect to canonical routes
  "/signin(.*)",
  "/signup(.*)",
  "/admin-setup",
  "/auth/oauth-success",
  "/.well-known/oauth-authorization-server(.*)",
  "/.well-known/oauth-protected-resource(.*)",
  "/api/webhooks(.*)",
  // Public API endpoints (avoid auth in middleware to prevent NEXT_HTTP_ERROR_FALLBACK noise)
  "/api/crypto(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Early return for Clerk internal catchall checks to prevent 404 digest throws in middleware
  if (
    pathname.includes("_clerk_catchall_check_") ||
    pathname.includes("SignIn_clerk_") ||
    pathname.includes("SignUp_clerk_")
  ) {
    return NextResponse.next();
  }

  // Allow public routes through without protection
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect everything else; prefer redirect over notFound to avoid NEXT_HTTP_ERROR_FALLBACK noise
  // Clerk/Next middleware requires absolute URLs for redirects
  const signInUrl = new URL('/sign-in', req.url).toString();
  await auth.protect({ unauthenticatedUrl: signInUrl });
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on all routes except static files and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Keep webhooks under middleware (but they are public per matcher above)
    "/(api/webhooks)(.*)",
  ],
};
