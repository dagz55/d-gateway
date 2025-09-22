import { auth, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
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

export default async function middleware(request: NextRequest) {
interface SessionClaims {
  // Define the properties of SessionClaims here
  [key: string]: any; // Example placeholder for dynamic properties
}

// Ensure req is passed as a parameter to the middleware function
const pathname = request.nextUrl.pathname;
  
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
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Clerk internal route - immediate return:', pathname);
    }
    return NextResponse.next();
  }

  // Early return for other public routes that don't need auth processing
  if (isPublicRoute(request)) {
    if (process.env.NODE_ENV === 'production') {
      console.log('📍 Public route - early return:', pathname);
    }
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // Protect all routes except public ones
  if (!userId) {
    // Redirect to sign-in page if not authenticated
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (userId) {
    // CRITICAL: Prevent redirect loops by checking referrer and patterns
    const referrer = request.headers.get('referer');
    const currentPath = request.nextUrl.pathname;

    // EMERGENCY: Prevent specific infinite redirect pattern
    // If accessing /admin or /member directly, and coming from those same routes, break the cycle
    if ((currentPath === '/admin' || currentPath === '/member') && referrer) {
      try {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.pathname === currentPath) {
          console.log('🚨 Emergency: Same-route loop detected, redirecting to admin setup');
          return NextResponse.redirect(new URL("/admin-setup", request.url));
        }
      } catch (e) {
        // Invalid referrer URL, continue
      }
    }
    // Debug current path and user
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Middleware Debug - Request Info:', {
        userId,
        pathname: request.nextUrl.pathname,
        url: request.url
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
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Middleware Debug - Admin Check Result:', {
        isUserAdmin,
        publicMetadataRole,
        isAdminFlag,
        metadataRole,
        directRole,
        organizationRole,
        orgMetadataRole,
        fullPublicMetadata: publicMetadata,
        currentPath: request.nextUrl.pathname
      });
    }

    // Handle legacy dashboard route redirects
    if (isLegacyDashboardRoute(request)) {
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Legacy Dashboard Redirect:', { isUserAdmin, currentPath: request.nextUrl.pathname });
      }
      if (isUserAdmin) {
        return NextResponse.redirect(new URL("/dashboard/admins", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/members", request.url));
      }
    }

    // Handle dashboard routes - these are accessible to all authenticated users
    if (isDashboardRoute(request)) {
      if (process.env.NODE_ENV === 'production') {
        console.log('🏠 Dashboard Route Access:', { isUserAdmin, currentPath: request.nextUrl.pathname });
      }
      // Dashboard routes are accessible to all authenticated users
      return NextResponse.next();
    }

    // Check admin access for admin routes
    if (isAdminRoute(request)) {
      if (process.env.NODE_ENV === 'production') {
        console.log('🔐 Admin Route Check:', { isUserAdmin, currentPath: request.nextUrl.pathname });
      }

      // Allow access to make-first-admin endpoint for any authenticated user
      if (request.nextUrl.pathname === "/api/admin/make-first-admin") {
        if (process.env.NODE_ENV === 'production') {
          console.log('🔑 Allowing access to make-first-admin endpoint');
        }
        return NextResponse.next();
      }

      if (!isUserAdmin) {
        // EMERGENCY BREAK: Prevent infinite redirect loops
        const hasRedirectParam = request.nextUrl.searchParams.has("admin_access_denied");
        const referrer = request.headers.get('referer');

        // If we already redirected them once, send them to a safe landing page
        if (hasRedirectParam || (referrer && referrer.includes("admin_access_denied"))) {
          if (process.env.NODE_ENV === 'production') {
            console.log('🚨 LOOP PREVENTION: Sending to landing page');
          }
          return NextResponse.redirect(new URL("/", request.url));
        }

        // First-time redirect to member dashboard
        if (!request.nextUrl.pathname.startsWith("/dashboard/members") && !request.nextUrl.pathname.startsWith("/member")) {
          if (process.env.NODE_ENV === 'production') {
            console.log('🚫 Non-admin accessing admin route, redirecting to member dashboard');
          }
          const memberUrl = new URL("/dashboard/members", request.url);
          memberUrl.searchParams.set("admin_access_denied", "true");
          return NextResponse.redirect(memberUrl);
        }
      }
    }

    // Check member access for member routes (prevent admins from accessing member routes)
    if (isMemberRoute(request) && isUserAdmin) {
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Admin accessing member route, redirecting to admin dashboard');
      }
      // Prevent redirect loop - only redirect if not already on admin routes
      if (!request.nextUrl.pathname.startsWith("/dashboard/admins") && !request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard/admins", request.url));
      }
    }


  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes  
    "/(api|trpc)(.*)",
  ],
};
