import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createRealtimeClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format. Should be https://your-project.supabase.co');
  }

  // Validate API key format (should not contain newlines or whitespace)
  const cleanAnonKey = supabaseAnonKey.trim().replace(/\s+/g, '');
  if (cleanAnonKey !== supabaseAnonKey) {
    console.warn('API key contains whitespace, cleaning...');
  }

  try {
    supabaseClient = createBrowserClient<Database>(supabaseUrl, cleanAnonKey, {
      realtime: {
        timeout: 10000, // 10 second timeout
        heartbeatIntervalMs: 30000, // 30 second heartbeat
        reconnectAfterMs: (tries: number) => {
          // Exponential backoff: 1s, 2s, 4s, 8s, then 10s max
          return Math.min(1000 * Math.pow(2, tries), 10000);
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });

    console.log('Supabase realtime client created successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Failed to create Supabase realtime client:', error);
    throw error;
  }
}

// Helper function to check realtime connection status
export function getRealtimeStatus() {
  if (!supabaseClient) {
    return 'not_initialized';
  }

  // Try to get the realtime connection status
  try {
    const realtime = (supabaseClient as any).realtime;
    if (realtime) {
      return realtime.connectionState || 'unknown';
    }
    return 'no_realtime';
  } catch (error) {
    console.warn('Error checking realtime status:', error);
    return 'error';
  }
}

// Helper function to reconnect realtime
export async function reconnectRealtime() {
  if (!supabaseClient) {
    console.warn('No Supabase client to reconnect');
    return false;
  }

  try {
    const realtime = (supabaseClient as any).realtime;
    if (realtime && realtime.disconnect && realtime.connect) {
      realtime.disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      realtime.connect();
      console.log('Realtime reconnection initiated');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error reconnecting realtime:', error);
    return false;
  }
}