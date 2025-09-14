import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { Database } from '@/lib/supabase/types'

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return { user, isAdmin: !!profile?.is_admin }
}

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await assertAdmin()
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const pair = searchParams.get('pair') || undefined
    const action = searchParams.get('action') || undefined

    let query = admin.from('signals').select('*', { count: 'exact' }).order('issued_at', { ascending: false })
    if (pair) query = query.eq('pair', pair)
    if (action) query = query.eq('action', action)

    const start = (page - 1) * limit
    const end = start + limit - 1
    const { data, error, count } = await query.range(start, end)
    if (error) throw error

    return NextResponse.json({ success: true, data: { items: data, total: count || 0, page, limit, totalPages: Math.max(1, Math.ceil((count || 0) / limit)) } })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, isAdmin } = await assertAdmin()
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const body = await request.json()
    const payload: Database['public']['Tables']['signals']['Insert'] = {
      user_id: body.user_id || user.id,
      pair: body.pair,
      action: body.action,
      target_price: body.target_price,
      stop_loss: body.stop_loss ?? null,
      take_profits: Array.isArray(body.take_profits) ? body.take_profits : null,
      status: body.status || 'ACTIVE',
      confidence: body.confidence ?? 50,
      issued_at: body.issued_at || new Date().toISOString(),
      expires_at: body.expires_at || null,
    }
    const { data, error } = await admin.from('signals').insert(payload).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, isAdmin } = await assertAdmin()
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const body = await request.json()
    if (!body?.id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })
    }
    const updates: Database['public']['Tables']['signals']['Update'] = {}
    for (const key of ['pair','action','target_price','stop_loss','status','confidence','issued_at','expires_at','take_profits','user_id']) {
      if (key in body) {
        (updates as any)[key] = body[key]
      }
    }
    const { data, error } = await admin.from('signals').update(updates).eq('id', body.id).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, isAdmin } = await assertAdmin()
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })

    const admin = createAdminClient()
    const { error } = await admin.from('signals').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}
