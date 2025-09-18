import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function GET() {
  const cookieStore = await cookies();

  // First, try to get the session from WorkOS using the custom session manager
  const accessToken = cookieStore.get('access_token')?.value;
  if (accessToken) {
    const { valid, session: workosSession } = await sessionManager.validateSession(accessToken);
    if (valid && workosSession) {
      return new NextResponse(JSON.stringify({ session: workosSession, source: 'workos' }), { status: 200 });
    }
  }

  // If no WorkOS session, try to get the session from Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  if (supabaseSession) {
    return new NextResponse(JSON.stringify({ session: supabaseSession, source: 'supabase' }), { status: 200 });
  }

  return new NextResponse(JSON.stringify({ session: null, source: 'none' }), { status: 401 });
}
