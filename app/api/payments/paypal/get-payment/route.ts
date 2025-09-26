import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: paymentData, error } = await supabase
      .from('paypal_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment data' },
        { status: 500 }
      );
    }

    if (!paymentData) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      customerName: paymentData.customer_name,
      customerEmail: paymentData.customer_email,
      status: paymentData.status,
      paymentLink: paymentData.payment_link,
      paypalOrderId: paymentData.paypal_order_id,
      transactionDetails: paymentData.transaction_details,
      createdAt: paymentData.created_at,
      updatedAt: paymentData.updated_at,
    });

  } catch (error) {
    console.error('Error fetching payment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
