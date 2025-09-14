import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase URL or service role key')
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  })
}

