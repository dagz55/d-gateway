import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createServerSupabaseClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your project settings.",
    )
  }

  // Validate URL format to prevent HTML responses
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    console.warn('Invalid Supabase URL format:', supabaseUrl)
    throw new Error('Invalid Supabase URL format. Should be https://your-project.supabase.co')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
