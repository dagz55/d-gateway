import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk-auth'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')?.toLowerCase()
    const pair = searchParams.get('pair') || undefined
    const action = (searchParams.get('action') as 'BUY' | 'SELL' | 'HOLD' | null) || undefined

    let query = supabase
      .from('signals')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })

    if (pair) query = query.eq('pair', pair)
    if (action) query = query.eq('action', action)
    if (search) {
      query = query.or(`pair.ilike.%${search}%,action.ilike.%${search}%`)
    }

    const start = (page - 1) * limit
    const end = start + limit - 1
    const { data, error, count } = await query.range(start, end)
    if (error) throw error

    const items = (data || []).map((row) => ({
      id: row.id,
      pair: row.pair,
      action: row.action === 'HOLD' ? 'BUY' : row.action, // map HOLD to BUY for UI if needed
      entry: row.target_price,
      sl: row.stop_loss ?? 0,
      tp: (row as any).take_profits ?? [],
      issuedAt: row.issued_at,
      status: row.status,
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
