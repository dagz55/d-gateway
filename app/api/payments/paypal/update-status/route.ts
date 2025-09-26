import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UpdatePaymentStatusRequest {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  paypalOrderId?: string;
  transactionDetails?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdatePaymentStatusRequest = await request.json();
    const { paymentId, status, paypalOrderId, transactionDetails } = body;

    // Validate required fields
    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update payment status
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (paypalOrderId) {
      updateData.paypal_order_id = paypalOrderId;
    }

    if (transactionDetails) {
      updateData.transaction_details = transactionDetails;
    }

    const { data: paymentData, error } = await supabase
      .from('paypal_payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
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
      success: true,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        updatedAt: paymentData.updated_at,
      },
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
