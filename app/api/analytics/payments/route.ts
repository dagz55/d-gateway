import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

interface TimeRange {
  start: Date;
  end: Date;
}

function getTimeRange(timeRange: string): TimeRange {
  const now = new Date();
  const start = new Date();

  switch (timeRange) {
    case '24h':
      start.setHours(now.getHours() - 24);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const { start, end } = getTimeRange(timeRange);

    const supabase = await createServerSupabaseClient();

    // Get all payments in the time range
    const { data: payments, error } = await supabase
      .from('paypal_payments')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (error) {
      throw error;
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalPayments: 0,
          totalRevenue: 0,
          successRate: 0,
          averageAmount: 0,
          paymentsByStatus: {
            completed: 0,
            pending: 0,
            failed: 0,
            cancelled: 0,
          },
          paymentsByDevice: {
            desktop: 0,
            mobile: 0,
            tablet: 0,
          },
          paymentsByCurrency: {
            USD: 0,
            EUR: 0,
            GBP: 0,
            PHP: 0,
          },
          hourlyDistribution: [],
          recentPayments: [],
          topCountries: [],
        }
      });
    }

    // Calculate analytics
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0;
    const averageAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Status distribution
    const paymentsByStatus = {
      completed: payments.filter(p => p.status === 'completed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      cancelled: payments.filter(p => p.status === 'cancelled').length,
    };

    // Device distribution
    const paymentsByDevice = {
      desktop: payments.filter(p => p.metadata?.device_type === 'desktop').length,
      mobile: payments.filter(p => p.metadata?.device_type === 'mobile').length,
      tablet: payments.filter(p => p.metadata?.device_type === 'tablet').length,
    };

    // Currency distribution
    const paymentsByCurrency = {
      USD: payments.filter(p => p.currency === 'USD').length,
      EUR: payments.filter(p => p.currency === 'EUR').length,
      GBP: payments.filter(p => p.currency === 'GBP').length,
      PHP: payments.filter(p => p.currency === 'PHP').length,
    };

    // Hourly distribution (last 24 hours)
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date();
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date();
      hourEnd.setHours(hour + 1, 0, 0, 0);

      const count = payments.filter(p => {
        const paymentTime = new Date(p.created_at);
        return paymentTime >= hourStart && paymentTime < hourEnd;
      }).length;

      return { hour, count };
    });

    // Recent payments (last 10)
    const recentPayments = payments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        customer_name: p.customer_name,
        created_at: p.created_at,
        device_type: p.metadata?.device_type || 'desktop',
      }));

    // Top countries by revenue
    const countryRevenue = new Map<string, { count: number; revenue: number }>();
    
    payments.forEach(payment => {
      if (payment.status === 'completed' && payment.metadata?.country) {
        const country = payment.metadata.country;
        const current = countryRevenue.get(country) || { count: 0, revenue: 0 };
        countryRevenue.set(country, {
          count: current.count + 1,
          revenue: current.revenue + (payment.amount || 0),
        });
      }
    });

    const topCountries = Array.from(countryRevenue.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const analytics = {
      totalPayments,
      totalRevenue,
      successRate: Math.round(successRate * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      paymentsByStatus,
      paymentsByDevice,
      paymentsByCurrency,
      hourlyDistribution,
      recentPayments,
      topCountries,
    };

    return NextResponse.json({
      success: true,
      analytics,
      metadata: {
        timeRange,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: error.message || 'An unexpected error occurred'
      }, 
      { status: 500 }
    );
  }
}
