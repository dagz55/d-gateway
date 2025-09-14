import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')?.toLowerCase()
    const pair = searchParams.get('pair') || undefined
    const side = (searchParams.get('side') as 'BUY' | 'SELL' | null) || undefined

    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('time', { ascending: false })

    if (pair) query = query.eq('pair', pair)
    if (side) query = query.eq('side', side)
    if (search) {
      // Search by pair or side
      query = query.or(`pair.ilike.%${search}%,side.ilike.%${search}%`)
    }

    const start = (page - 1) * limit
    const end = start + limit - 1
    const { data, error, count } = await query.range(start, end)
    if (error) throw error

    const items = (data || []).map((row) => ({
      id: row.id,
      pair: row.pair,
      side: row.side,
      price: row.price,
      qty: row.amount,
      time: row.time,
      pnl: row.pnl ?? undefined,
    }))

    const total = count || 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      success: true,
      data: { items, total, page, limit, totalPages }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error' }, { status: 500 })
  }
}
