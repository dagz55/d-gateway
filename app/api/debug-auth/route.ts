import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, sessionId } = auth();
    return new Response(
      JSON.stringify({ ok: true, userId: userId ?? null, sessionId: sessionId ?? null }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
