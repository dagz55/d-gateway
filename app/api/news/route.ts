import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = (searchParams.get('search') || '').toLowerCase();

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,source.ilike.%${search}%`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error, count } = await query.range(start, end);
    if (error) throw error;

    const items = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      source: row.source,
      url: row.url,
      publishedAt: row.published_at,
      summary: row.summary || undefined,
    }));

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: { items, total, page, limit, totalPages },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
