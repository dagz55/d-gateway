/// <reference types="@clerk/types" />
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Root path for landing page
  "/sign-in(.*)", // Clerk sign-in pages and internal routes
  "/sign-up(.*)", // Clerk sign-up pages and internal routes
  "/admin-setup", // Admin setup page
  "/api/webhooks(.*)", // Webhook endpoints
  "/market", // Public market page
  "/enterprise", // Public enterprise page
  "/help", // Public help page
  "/auth/oauth-success", // Temporary OAuth redirect handler
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  "/dashboard/admins(.*)", // Admin dashboard structure
  "/admin(.*)", // Legacy admin routes
  "/api/admin(.*)",
]);

// Define member routes
const isMemberRoute = createRouteMatcher([
  "/dashboard/members(.*)", // Member dashboard structure
  "/member(.*)", // Legacy member routes
]);

// Define legacy dashboard routes that need to be redirected
const isLegacyDashboardRoute = createRouteMatcher([
  "/dashboard$", // Exact match for /dashboard only
]);


// Define dashboard routes that are accessible directly
const isDashboardRoute = createRouteMatcher([
  "/profile(.*)",
  "/settings(.*)",
  "/wallet(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  
  // Early return for landing page - no middleware processing needed
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Early return for Clerk internal routes (catchall checks) - most specific first
  if (pathname.includes("clerk_catchall_check") || 
      pathname.includes("SignIn_clerk") ||
      pathname.includes("SignUp_clerk") ||
      pathname.match(/\/sign-in\/.*_clerk.*/) ||
      pathname.match(/\/sign-up\/.*_clerk.*/)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Clerk internal route - immediate return:', pathname);
    }
    return NextResponse.next();
  }

  // Early return for other public routes that don't need auth processing
  if (isPublicRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Public route - early return:', pathname);
    }
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // Protect all routes except public ones
  if (!userId) {
    // Redirect to sign-in page if not authenticated
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (userId) {
    // CRITICAL: Prevent redirect loops by checking referrer and patterns
    const referrer = req.headers.get('referer');
    const currentPath = req.nextUrl.pathname;

    // EMERGENCY: Prevent specific infinite redirect pattern
    // If accessing /admin or /member directly, and coming from those same routes, break the cycle
    if ((currentPath === '/admin' || currentPath === '/member') && referrer) {
      try {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.pathname === currentPath) {
          console.log('🚨 Emergency: Same-route loop detected, redirecting to admin setup');
          return NextResponse.redirect(new URL("/admin-setup", req.url));
        }
      } catch (e) {
        // Invalid referrer URL, continue
      }
    }
    // Debug current path and user
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware Debug - Request Info:', {
        userId,
        pathname: req.nextUrl.pathname,
        url: req.url
      });
    }
    
    // CRITICAL FIX: Properly access session claims for admin role detection
    const publicMetadata = sessionClaims?.publicMetadata as any;

    const publicMetadataRole = publicMetadata?.role;
    const isAdminFlag = publicMetadata?.is_admin;
    const metadataRole = (sessionClaims as any)?.metadata?.role;
    const directRole = (sessionClaims as any)?.role;
    const organizationRole = (sessionClaims as any)?.org_role;
    const orgMetadataRole = (sessionClaims as any)?.orgMetadata?.role;

    const isUserAdmin =
      publicMetadataRole === "admin" ||
      isAdminFlag === true ||
      metadataRole === "admin" ||
      directRole === "admin" ||
      organizationRole === "admin" ||
      orgMetadataRole === "admin";
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware Debug - Admin Check Result:', {
        isUserAdmin,
        publicMetadataRole,
        isAdminFlag,
        metadataRole,
        directRole,
        organizationRole,
        orgMetadataRole,
        fullPublicMetadata: publicMetadata,
        currentPath: req.nextUrl.pathname
      });
    }

    // Handle legacy dashboard route redirects
    if (isLegacyDashboardRoute(req)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Legacy Dashboard Redirect:', { isUserAdmin, currentPath: req.nextUrl.pathname });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/dashboard/admins", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/members", req.url));
      }
    }

    // Handle dashboard routes - these are accessible to all authenticated users
    if (isDashboardRoute(req)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🏠 Dashboard Route Access:', { isUserAdmin, currentPath: req.nextUrl.pathname });
      }
      // Dashboard routes are accessible to all authenticated users
      return NextResponse.next();
    }

    // Check admin access for admin routes
    if (isAdminRoute(req)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Admin Route Check:', { isUserAdmin, currentPath: req.nextUrl.pathname });
      }

      // Allow access to make-first-admin endpoint for any authenticated user
      if (req.nextUrl.pathname === "/api/admin/make-first-admin") {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔑 Allowing access to make-first-admin endpoint');
        }
        return NextResponse.next();
      }

      if (!isUserAdmin) {
        // EMERGENCY BREAK: Prevent infinite redirect loops
        const hasRedirectParam = req.nextUrl.searchParams.has("admin_access_denied");
        const referrer = req.headers.get('referer');

        // If we already redirected them once, send them to a safe landing page
        if (hasRedirectParam || (referrer && referrer.includes("admin_access_denied"))) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚨 LOOP PREVENTION: Sending to landing page');
          }
          return NextResponse.redirect(new URL("/", req.url));
        }

        // First-time redirect to member dashboard
        if (!req.nextUrl.pathname.startsWith("/dashboard/members") && !req.nextUrl.pathname.startsWith("/member")) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚫 Non-admin accessing admin route, redirecting to member dashboard');
          }
          const memberUrl = new URL("/dashboard/members", req.url);
          memberUrl.searchParams.set("admin_access_denied", "true");
          return NextResponse.redirect(memberUrl);
        }
      }
    }

    // Check member access for member routes (prevent admins from accessing member routes)
    if (isMemberRoute(req) && isUserAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Admin accessing member route, redirecting to admin dashboard');
      }
      // Prevent redirect loop - only redirect if not already on admin routes
      if (!req.nextUrl.pathname.startsWith("/dashboard/admins") && !req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard/admins", req.url));
      }
    }

    // Redirect authenticated users from sign-in/sign-up pages based on role
    // But only if they're not in the middle of an auth flow
    if ((req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up") &&
        !req.nextUrl.searchParams.has('redirect_url')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Auth page redirect:', { isUserAdmin });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/dashboard/admins", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/members", req.url));
      }
    }

  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes  
    "/(api|trpc)(.*)",
  ],
};
