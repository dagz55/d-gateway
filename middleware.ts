import { clerkMiddleware } from "@clerk/nextjs/server";

// Declare public routes that are accessible without authentication
const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Legacy aliases that we redirect to the canonical routes
  "/signin(.*)",
  "/signup(.*)",
  "/admin-setup",
  "/api/webhooks(.*)",
  "/market",
  "/enterprise",
  "/help",
  "/auth/oauth-success",
];

export default clerkMiddleware({ publicRoutes });

export const config = {
  matcher: [
    // Run on all routes except static files and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
