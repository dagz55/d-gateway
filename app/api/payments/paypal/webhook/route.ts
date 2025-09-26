import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paypal-transmission-id');
    const certId = request.headers.get('paypal-cert-id');
    const authAlgo = request.headers.get('paypal-auth-algo');
    const transmissionSig = request.headers.get('paypal-transmission-sig');
    const transmissionTime = request.headers.get('paypal-transmission-time');

    // Verify webhook signature (in production, you should verify PayPal's signature)
    // For now, we'll process the webhook without signature verification
    // In production, implement proper PayPal webhook signature verification

    const webhookData = JSON.parse(body);
    console.log('PayPal Webhook received:', webhookData);

    // Handle different webhook event types
    switch (webhookData.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookData);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentFailed(webhookData);
        break;
      case 'PAYMENT.CAPTURE.PENDING':
        await handlePaymentPending(webhookData);
        break;
      default:
        console.log('Unhandled webhook event type:', webhookData.event_type);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(webhookData: any) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Extract payment information from webhook
    const capture = webhookData.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const amount = capture.amount?.value;
    const currency = capture.amount?.currency_code;
    
    // Find the payment record by PayPal order ID
    const { data: payment, error: findError } = await supabase
      .from('paypal_payments')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();

    if (findError || !payment) {
      console.error('Payment not found for order ID:', orderId);
      return;
    }

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('paypal_payments')
      .update({
        status: 'completed',
        transaction_details: webhookData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return;
    }

    console.log('Payment completed successfully:', payment.id);

    // Here you can add additional logic like:
    // - Send confirmation email to customer
    // - Update user account balance
    // - Trigger other business logic

  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

async function handlePaymentFailed(webhookData: any) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const capture = webhookData.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    
    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from('paypal_payments')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();

    if (findError || !payment) {
      console.error('Payment not found for order ID:', orderId);
      return;
    }

    // Update payment status to failed
    const { error: updateError } = await supabase
      .from('paypal_payments')
      .update({
        status: 'failed',
        transaction_details: webhookData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return;
    }

    console.log('Payment failed:', payment.id);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentPending(webhookData: any) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const capture = webhookData.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    
    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from('paypal_payments')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();

    if (findError || !payment) {
      console.error('Payment not found for order ID:', orderId);
      return;
    }

    // Update payment status to pending (if not already)
    const { error: updateError } = await supabase
      .from('paypal_payments')
      .update({
        status: 'pending',
        transaction_details: webhookData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return;
    }

    console.log('Payment pending:', payment.id);

  } catch (error) {
    console.error('Error handling payment pending:', error);
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'PayPal webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
