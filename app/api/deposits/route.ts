import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, logSecurityEvent } from '@/lib/auth-middleware'
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

    const start = (page - 1) * limit
    const end = start + limit - 1
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('type', 'DEPOSIT')
      .order('created_at', { ascending: false })
      .range(start, end)
    if (error) throw error

    const items = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      method: row.method || undefined,
      destination: row.destination || undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at || undefined,
    }))

    const total = count || 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({ success: true, data: { items, total, page, limit, totalPages } })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      logSecurityEvent('unauthorized_deposit_attempt', {
        reason: 'User not authenticated'
      });
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const amount = Number(body?.amount)
    const currency = body?.currency
    const method = body?.method || null
    
    // Validate input for security
    if (!amount || !currency) {
      logSecurityEvent('invalid_deposit_data', {
        userId: user.id,
        amount: amount || 'missing',
        currency: currency || 'missing'
      });
      return NextResponse.json({ success: false, message: 'Invalid deposit data' }, { status: 400 })
    }

    // Additional security validations
    if (amount <= 0 || amount > 1000000) { // Max $1M deposit
      logSecurityEvent('suspicious_deposit_amount', {
        userId: user.id,
        amount: amount,
        currency: currency
      });
      return NextResponse.json({ success: false, message: 'Invalid deposit amount' }, { status: 400 })
    }

    const allowedCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH'];
    if (!allowedCurrencies.includes(currency.toUpperCase())) {
      logSecurityEvent('invalid_currency', {
        userId: user.id,
        currency: currency
      });
      return NextResponse.json({ success: false, message: 'Invalid currency' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'DEPOSIT',
        amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        method,
      })
      .select()
      .single()
    
    if (error) throw error

    const created = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: data.method || undefined,
      destination: data.destination || undefined,
      createdAt: data.created_at,
      completedAt: data.completed_at || undefined,
    }

    logSecurityEvent('deposit_created', {
      userId: user.id,
      transactionId: data.id,
      amount: amount,
      currency: currency.toUpperCase(),
      method: method || 'unknown'
    });

    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    logSecurityEvent('deposit_creation_failed', {
      error: error?.message || 'Unknown error'
    });
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error' }, { status: 500 })
  }
}