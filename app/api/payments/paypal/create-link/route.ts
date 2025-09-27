import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { v4 as uuidv4 } from 'uuid';

interface CreatePaymentLinkRequest {
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentLinkRequest = await request.json();
    const { amount, currency, description, customerName, customerEmail } = body;

    // Validate required fields
    if (!amount || !currency || !description || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate unique payment ID
    const paymentId = uuidv4();
    
    // Create payment link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/ncp/payment/${paymentId}`;

    // Store payment data in database
    const supabase = createAdminClient();
    
    const { data: paymentData, error } = await supabase
      .from('paypal_payments')
      .insert({
        id: paymentId,
        amount: amount,
        currency: currency,
        description: description,
        customer_name: customerName,
        customer_email: customerEmail,
        status: 'pending',
        payment_link: paymentLink,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentId: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      customerName: paymentData.customer_name,
      customerEmail: paymentData.customer_email,
      status: paymentData.status,
      paymentLink: paymentData.payment_link,
      createdAt: paymentData.created_at,
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
