/// <reference types="@clerk/types" />
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Root path for landing page
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth(.*)", // All auth routes including OAuth callbacks
  "/api/webhooks(.*)",
  "/market", // Public market page
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  "/dashboard/admins(.*)", // Admin dashboard structure
  "/api/admin(.*)",
]);

// Define member routes
const isMemberRoute = createRouteMatcher([
  "/dashboard/members(.*)", // Member dashboard structure
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
  const { userId, sessionClaims } = await auth();

  // Protect all routes except public ones
  if (!isPublicRoute(req) && !userId) {
    // Redirect to sign-in page if not authenticated
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (userId) {
    // Debug current path and user
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware Debug - Request Info:', {
        userId,
        pathname: req.nextUrl.pathname,
        url: req.url
      });
    }
    
    // Check admin role - includes organization support since it's re-enabled
    const publicMetadataRole = (sessionClaims as any)?.publicMetadata?.role;
    const metadataRole = (sessionClaims as any)?.metadata?.role;
    const directRole = (sessionClaims as any)?.role;
    const organizationRole = (sessionClaims as any)?.org_role;
    const orgMetadataRole = (sessionClaims as any)?.orgMetadata?.role;

    const isUserAdmin =
      publicMetadataRole === "admin" ||
      metadataRole === "admin" ||
      (sessionClaims?.publicMetadata as any)?.role === "admin" ||
      directRole === "admin" ||
      organizationRole === "admin" ||
      orgMetadataRole === "admin";
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware Debug - Admin Check Result:', {
        isUserAdmin,
        publicMetadataRole,
        metadataRole,
        directRole,
        organizationRole,
        orgMetadataRole,
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
        // Prevent redirect loop - only redirect if not already on member dashboard
        if (req.nextUrl.pathname !== "/dashboard/members") {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚫 Non-admin accessing admin route, redirecting to member dashboard');
          }
          return NextResponse.redirect(new URL("/dashboard/members", req.url));
        }
      }
    }

    // Check member access for member routes (prevent admins from accessing member routes)
    if (isMemberRoute(req) && isUserAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Admin accessing member route, redirecting to admin dashboard');
      }
      // Prevent redirect loop - only redirect if not already on admin dashboard or admin routes
      if (!req.nextUrl.pathname.startsWith("/dashboard/admins")) {
        return NextResponse.redirect(new URL("/dashboard/admins", req.url));
      }
    }

    // Redirect authenticated users from sign-in/sign-up pages based on role
    if (req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up") {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Auth page redirect:', { isUserAdmin });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/dashboard/admins", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/members", req.url));
      }
    }

    // Redirect root path based on user role
    if (req.nextUrl.pathname === "/") {
      if (process.env.NODE_ENV === 'development') {
        console.log('🏠 Root path redirect:', { isUserAdmin });
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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
