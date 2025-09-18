import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
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

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const { user } = session;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return new NextResponse(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
    }

    return new NextResponse(JSON.stringify({ user, profile }), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
