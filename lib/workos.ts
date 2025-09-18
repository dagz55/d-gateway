import { WorkOS } from '@workos-inc/node';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

// Initialize WorkOS client
export const workos = new WorkOS(process.env.WORKOS_API_KEY);

// WorkOS configuration based on domain settings
export const workosConfig = {
  // Core configuration
  clientId: process.env.WORKOS_CLIENT_ID!,
  cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
  
  // Domain configuration based on WorkOS setup
  domains: {
    email: process.env.WORKOS_EMAIL_DOMAIN || 'workos.dev',
    adminPortal: process.env.WORKOS_ADMIN_PORTAL_DOMAIN || 'setup.workos.com',
    authenticationApi: process.env.WORKOS_AUTH_API_DOMAIN || 'auth.workos.com',
    authKit: process.env.WORKOS_AUTHKIT_DOMAIN || 'exciting-tea-84-staging.authkit.app',
  },
  
  // Authentication endpoints
  redirectUri: process.env.WORKOS_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zignals.org'}/api/auth/workos/callback`,
  loginEndpoint: process.env.WORKOS_LOGIN_ENDPOINT || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zignals.org'}/api/auth/workos/login`,
  logoutRedirectUri: process.env.WORKOS_LOGOUT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zignals.org'}/`,
  
  // API endpoints
  issuerUrl: process.env.WORKOS_ISSUER_URL || `https://api.workos.com/user_management/${process.env.WORKOS_CLIENT_ID}`,
  authKitUrl: process.env.WORKOS_AUTHKIT_URL || `https://exciting-tea-84-staging.authkit.app`,
  
  // Environment-specific settings
  environment: process.env.NODE_ENV || 'development',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zignals.org',
};

// Validate required environment variables
export function validateWorkOSConfig() {
  const required = [
    'WORKOS_API_KEY',
    'WORKOS_CLIENT_ID',
    'WORKOS_COOKIE_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required WorkOS environment variables: ${missing.join(', ')}`);
  }

  // Validate cookie password length (must be 32 characters)
  if (process.env.WORKOS_COOKIE_PASSWORD && process.env.WORKOS_COOKIE_PASSWORD.length !== 32) {
    throw new Error('WORKOS_COOKIE_PASSWORD must be exactly 32 characters long');
  }
}

// Commented out - authkit-nextjs doesn't export getSession in this version
// import { getSession as authkitGetSession } from '@workos-inc/authkit-nextjs';

// export async function getSession() {
//   return authkitGetSession();
// }
