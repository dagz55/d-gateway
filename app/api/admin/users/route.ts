import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk-auth'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import { createAdminClient } from '@/lib/supabase/adminClient'

async function assertAdmin(request?: NextRequest) {
  // Skip authentication during build time
  if (process.env.NODE_ENV === 'production' && request && !request.headers.get('user-agent')) {
    return { user: null, isAdmin: false, buildTime: true }
  }

  const user = await getCurrentUser()
  if (!user) return { user: null, isAdmin: false }
  
  // For now, we'll check if the user's email contains 'admin' or is a specific admin email
  const isAdminUser = user.email?.includes('admin') || user.email === 'admin@zignals.org'
  return { user, isAdmin: isAdminUser }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await assertAdmin(request)
    if (adminCheck.buildTime) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { limit: 50, offset: 0, count: 0 },
        note: 'Build time execution - no data available'
      })
    }
    
    const { user, isAdmin } = adminCheck
    if (!user || !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const q = (searchParams.get('q') || '').toLowerCase()

    let query = admin
      .from('profiles')
      .select('id, email, username, full_name, is_admin, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(`email.ilike.%${q}%,username.ilike.%${q}%,full_name.ilike.%${q}%`)
    }

    const start = (page - 1) * limit
    const end = start + limit - 1
    const { data, error, count } = await query.range(start, end)
    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        items: data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil((count || 0) / limit))
      }
    })
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

    const body = await request.json()
    const targetId: string | undefined = body?.id
    const newValue: boolean | undefined = body?.is_admin
    if (!targetId || typeof newValue !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }

    // optional safety: prevent removing your own admin accidentally
    if (user.id === targetId && newValue === false) {
      return NextResponse.json({ success: false, message: 'Cannot remove your own admin rights' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('profiles')
      .update({ is_admin: newValue })
      .eq('id', targetId)
      .select('id, email, username, full_name, is_admin')
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal error' }, { status: 500 })
  }
}

