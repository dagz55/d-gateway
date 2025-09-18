import { createClient } from '@supabase/supabase-js';
import { workosConfig } from '../workos';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

// Create Supabase client configured for WorkOS integration
export const createWorkOSSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your project settings.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      // Configure for WorkOS third-party auth
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'workos-supabase-integration',
      },
    },
  });
};

// Set WorkOS access token for Supabase authentication
export const setWorkOSAccessToken = async (supabaseClient: any, accessToken: string) => {
  try {
    // For now, we'll skip the Supabase integration since WorkOS handles authentication
    // This is a placeholder for future integration
    console.log('WorkOS access token received, but Supabase integration is disabled for now');
    return null;
  } catch (error) {
    console.warn('Failed to set WorkOS access token for Supabase:', error);
    return null;
  }
};

// Get current user from Supabase using WorkOS token
export const getCurrentSupabaseUser = async (supabaseClient: any) => {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.error('Failed to get current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign out from both WorkOS and Supabase
export const signOutFromBoth = async (supabaseClient: any) => {
  try {
    // Sign out from Supabase
    await supabaseClient.auth.signOut();
    
    // Redirect to WorkOS logout (handled by the logout API route)
    window.location.href = '/api/auth/workos/logout';
  } catch (error) {
    console.error('Error signing out:', error);
    // Fallback to WorkOS logout
    window.location.href = '/api/auth/workos/logout';
  }
};
