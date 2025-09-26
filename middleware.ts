import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Environment validation is handled by scripts/validate-env.js (run via npm run check-env)

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
  "/auth/post-login", // allow client-side role routing without middleware auth
  "/.well-known/oauth-authorization-server(.*)",
  "/.well-known/oauth-protected-resource(.*)",
  "/api/webhooks(.*)",
  // Public API endpoints (avoid auth in middleware to prevent NEXT_HTTP_ERROR_FALLBACK noise)
  "/api/crypto(.*)",
  "/api/payments/paypal(.*)",
  // Test and payment pages
  "/test-payment",
  "/ncp/payment(.*)",
]);

// Auth pages matcher to avoid rendering SignIn/SignUp for authenticated users
const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/signin(.*)", "/signup(.*)"]);
// Dashboard alias matcher (we will redirect to role-based dashboards)
const isDashboardAlias = createRouteMatcher(["/dashboard(.*)"]);

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

  // If authenticated and visiting auth pages, redirect to post-login handler
  try {
    const { userId } = await auth();
    if (userId && isAuthPage(req)) {
      const postLoginUrl = new URL('/auth/post-login', req.url);
      return NextResponse.redirect(postLoginUrl);
    }

  } catch {
    // no-op: fall back to standard flow
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
