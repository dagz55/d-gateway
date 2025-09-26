import { redirect } from 'next/navigation';

/**
 * OAuth Success Redirect Handler
 *
 * This page serves as a temporary redirect handler for Clerk OAuth flows
 * that are still configured to use the old /auth/oauth-success path.
 *
 * Production uses external authentication domain: https://account.zignals.org
 * This handler redirects to the dashboard for compatibility.
 */
export default function OAuthSuccessRedirect() {
  // Immediately redirect to role-based destination
  redirect('/auth/post-login');
}