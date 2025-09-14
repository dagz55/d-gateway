import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Validate URL format to prevent HTML responses
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    console.warn('Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format. Should be https://your-project.supabase.co');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
