import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, logSecurityEvent } from '@/lib/clerk-auth'
import Stripe from 'stripe'

// Initialize Stripe lazily to avoid build errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe configuration missing');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
    maxNetworkRetries: 3,
    timeout: 10000,
    telemetry: false, // Disable telemetry in production
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe configuration missing in production');
      return NextResponse.json(
        { success: false, message: 'Payment service unavailable' },
        { status: 503 }
      )
    }

    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      logSecurityEvent('unauthorized_payment_link_attempt', {
        reason: 'User not authenticated',
        endpoint: '/api/payment-links'
      });
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      amount, 
      currency = 'usd', 
      description, 
      successUrl, 
      cancelUrl,
      packageId,
      packageName 
    } = body

    // Validate input
    if (!amount || !description) {
      logSecurityEvent('invalid_payment_link_data', {
        userId: user.id,
        amount: amount || 'missing',
        description: description || 'missing'
      });
      return NextResponse.json(
        { success: false, message: 'Amount and description are required' },
        { status: 400 }
      )
    }

    // Additional security validations
    if (amount <= 0 || amount > 1000000) { // Max $1M payment
      logSecurityEvent('suspicious_payment_amount', {
        userId: user.id,
        amount: amount,
        currency: currency
      });
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create payment link
    const paymentLink = await getStripe().paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: packageName || description,
              description: description,
              metadata: {
                user_id: user.id,
                package_id: packageId || '',
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/success`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: user.id,
        package_id: packageId || '',
        created_by: 'zignal_admin',
      },
    })

    return NextResponse.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.url,
        amount: amount,
        currency: currency,
        description: description,
        created: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Payment link creation error:', error)
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Payment error: ${error.message}`,
          error: error.code 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // List payment links for the user
    const paymentLinks = await getStripe().paymentLinks.list({
      limit: 10,
    })

    const userPaymentLinks = paymentLinks.data.filter(
      link => link.metadata?.user_id === user.id
    )

    return NextResponse.json({
      success: true,
      paymentLinks: userPaymentLinks.map(link => ({
        id: link.id,
        url: link.url,
        active: link.active,
        created: link.created_at ? new Date(link.created_at * 1000).toISOString() : new Date().toISOString(),
        metadata: link.metadata,
      })),
    })

  } catch (error) {
    console.error('Payment links retrieval error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve payment links' },
      { status: 500 }
    )
  }
}
