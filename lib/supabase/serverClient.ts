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
      async getAll() {
        return await cookieStore.getAll()
      },
      async setAll(cookiesToSet) {
        try {
          // Filter out large cookies to prevent header overflow
          const filteredCookies = cookiesToSet.filter(({ name, value }) => {
            // Skip very large cookies that might cause header overflow
            if (value.length > 4000) { // 4KB per cookie limit
              console.warn(`Skipping large cookie in server client: ${name} (${value.length} bytes)`)
              return false
            }
            return true
          })

          for (const { name, value, options } of filteredCookies) {
            // Set secure cookie options to prevent issues
            const secureOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax' as const,
              path: '/',
              maxAge: options?.maxAge || 60 * 60 * 24 * 7 // 7 days default
            }
            await cookieStore.set(name, value, secureOptions)
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}