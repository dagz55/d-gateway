/// <reference types="@clerk/types" />
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Root path for landing page
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

// Define member routes
const isMemberRoute = createRouteMatcher([
  "/member(.*)",
]);

// Define legacy dashboard routes that need to be redirected
const isLegacyDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
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
    
    // Check multiple possible locations for admin role
    const publicMetadataRole = (sessionClaims as any)?.publicMetadata?.role;
    const metadataRole = (sessionClaims as any)?.metadata?.role;
    const directRole = (sessionClaims as any)?.role;
    const organizationRole = (sessionClaims as any)?.o?.rol;
    
    const isUserAdmin = 
      publicMetadataRole === "admin" ||
      metadataRole === "admin" ||
      (sessionClaims?.publicMetadata as any)?.role === "admin" ||
      directRole === "admin" ||
      organizationRole === "admin";
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Middleware Debug - Admin Check Result:', {
        isUserAdmin,
        publicMetadataRole,
        metadataRole,
        directRole,
        organizationRole,
        currentPath: req.nextUrl.pathname
      });
    }

    // Handle legacy dashboard route redirects
    if (isLegacyDashboardRoute(req)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Legacy Dashboard Redirect:', { isUserAdmin, currentPath: req.nextUrl.pathname });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
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
      if (!isUserAdmin) {
        // Prevent redirect loop - only redirect if not already on member dashboard
        if (req.nextUrl.pathname !== "/member/dashboard") {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚫 Non-admin accessing admin route, redirecting to member dashboard');
          }
          return NextResponse.redirect(new URL("/member/dashboard", req.url));
        }
      }
      // Redirect from /admin to /admin/dashboard for authenticated admins
      if (req.nextUrl.pathname === "/admin" && isUserAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Check member access for member routes (prevent admins from accessing member routes)
    if (isMemberRoute(req) && isUserAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Admin accessing member route, redirecting to admin dashboard');
      }
      // Prevent redirect loop - only redirect if not already on admin dashboard
      if (req.nextUrl.pathname !== "/admin/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Redirect authenticated users from sign-in/sign-up pages based on role
    if (req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up") {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Auth page redirect:', { isUserAdmin });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
      }
    }

    // Redirect root path based on user role
    if (req.nextUrl.pathname === "/") {
      if (process.env.NODE_ENV === 'development') {
        console.log('🏠 Root path redirect:', { isUserAdmin });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
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
