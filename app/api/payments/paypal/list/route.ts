import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';

interface PayPalPaymentDB {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'completed' | 'failed';
  payment_link: string;
  paypal_order_id?: string;
  transaction_details?: any;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // Use admin client for PayPal operations
    const supabase = createAdminClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('paypal_payments')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: payments, error } = await query as { data: PayPalPaymentDB[] | null; error: any };

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('paypal_payments')
      .select('*', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count error:', countError);
    }

    // Transform the data to match the expected interface
    const transformedPayments = (payments || []).map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      customerName: payment.customer_name,
      customerEmail: payment.customer_email,
      status: payment.status,
      paymentLink: payment.payment_link,
      paypalOrderId: payment.paypal_order_id,
      transactionDetails: payment.transaction_details,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));

    return NextResponse.json({
      payments: transformedPayments,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
