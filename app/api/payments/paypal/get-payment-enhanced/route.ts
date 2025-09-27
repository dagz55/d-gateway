import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { headers } from 'next/headers';

interface SecurityHeaders {
  'x-forwarded-for'?: string;
  'x-real-ip'?: string;
  'user-agent'?: string;
  'referer'?: string;
  'x-forwarded-proto'?: string;
}

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_link: string;
  created_at: string;
  updated_at?: string;
  paypal_order_id?: string;
  paypal_transaction_id?: string;
  payment_method?: string;
  fees?: number;
  net_amount?: number;
  expiry_date?: string;
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    device_type?: string;
    risk_score?: number;
    country?: string;
    city?: string;
  };
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Device type detection
function detectDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile';
  }
  if (/Tablet|iPad/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

// Basic risk assessment
function calculateRiskScore(ip: string, userAgent: string, referrer?: string): number {
  let score = 0;
  
  // Check for suspicious user agents
  if (!userAgent || userAgent.length < 10) score += 30;
  if (/bot|crawler|spider|scraper/i.test(userAgent)) score += 50;
  
  // Check for suspicious IP patterns (basic)
  if (ip) {
    const ipParts = ip.split('.');
    if (ipParts.length === 4) {
      // Check for private/local IPs
      const firstOctet = parseInt(ipParts[0]);
      if (firstOctet === 10 || firstOctet === 172 || firstOctet === 192) {
        score += 20; // Higher risk for private IPs
      }
    }
  }
  
  // Check referrer
  if (!referrer || referrer === '') score += 10;
  
  return Math.min(score, 100);
}

// Rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max 100 requests per 15 minutes
  
  const key = `rate_limit:${ip}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clean up rate limit store periodically
    cleanupRateLimit();
    
    // Get security headers
    const headersList = headers();
    const securityHeaders: SecurityHeaders = {
      'x-forwarded-for': headersList.get('x-forwarded-for') || undefined,
      'x-real-ip': headersList.get('x-real-ip') || undefined,
      'user-agent': headersList.get('user-agent') || undefined,
      'referer': headersList.get('referer') || undefined,
      'x-forwarded-proto': headersList.get('x-forwarded-proto') || undefined,
    };

    // Extract IP address
    const ip = securityHeaders['x-forwarded-for']?.split(',')[0]?.trim() || 
               securityHeaders['x-real-ip'] || 
               'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 900 // 15 minutes in seconds
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString()
          }
        }
      );
    }

    // Get payment ID from query parameters
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing payment ID',
          message: 'Payment ID is required' 
        }, 
        { status: 400 }
      );
    }

    // Validate payment ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(paymentId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment ID format',
          message: 'Payment ID must be a valid UUID' 
        }, 
        { status: 400 }
      );
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(ip, securityHeaders['user-agent'] || '', securityHeaders['referer']);
    const deviceType = detectDeviceType(securityHeaders['user-agent'] || '');

    // Get payment data from database
    const supabase = await createServerSupabaseClient();
    
    const { data: paymentData, error } = await supabase
      .from('paypal_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !paymentData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment not found',
          message: 'The requested payment could not be found' 
        }, 
        { status: 404 }
      );
    }

    // Check if payment has expired
    if (paymentData.expiry_date) {
      const expiryDate = new Date(paymentData.expiry_date);
      const now = new Date();
      if (now > expiryDate) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Payment expired',
            message: 'This payment link has expired' 
          }, 
          { status: 410 }
        );
      }
    }

    // Enhanced payment data with security metadata
    const enhancedPaymentData: PaymentData = {
      ...paymentData,
      metadata: {
        ip_address: ip,
        user_agent: securityHeaders['user-agent'],
        referrer: securityHeaders['referer'],
        device_type: deviceType,
        risk_score: riskScore,
      }
    };

    // Log security event
    console.log('Payment access:', {
      paymentId,
      ip,
      userAgent: securityHeaders['user-agent'],
      deviceType,
      riskScore,
      timestamp: new Date().toISOString()
    });

    // Return enhanced payment data
    return NextResponse.json({
      success: true,
      payment: enhancedPaymentData,
      security: {
        riskScore,
        deviceType,
        ip,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Enhanced payment API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request' 
      }, 
      { status: 500 }
    );
  }
}
