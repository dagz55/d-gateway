import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use Supabase's get_dashboard_stats function if available
    const { data: stats, error } = await supabase
      .rpc('get_dashboard_stats', { user_uuid: user.id });

    if (error) {
      console.error('Dashboard stats RPC error:', error);
      
      // Fallback: Calculate stats manually from individual tables
      try {
        // Get user balance
        const { data: balanceData } = await supabase
          .rpc('get_user_balance', { user_uuid: user.id });

        // Get today's P&L
        const today = new Date().toISOString().split('T')[0];
        const { data: tradesData } = await supabase
          .from('trades')
          .select('pnl')
          .eq('user_id', user.id)
          .gte('created_at', today + 'T00:00:00.000Z')
          .lt('created_at', today + 'T23:59:59.999Z');

        const pnlToday = tradesData?.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0;

        // Get open signals count
        const { count: openSignals } = await supabase
          .from('signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'ACTIVE');

        // Get total trades count
        const { count: totalTrades } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate win rate
        const { data: winningTrades } = await supabase
          .from('trades')
          .select('pnl')
          .eq('user_id', user.id)
          .gt('pnl', 0);

        const winRate = totalTrades > 0 ? ((winningTrades?.length || 0) / totalTrades) * 100 : 0;

        // Get last deposit amount
        const { data: lastDepositData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'DEPOSIT')
          .eq('status', 'COMPLETED')
          .order('created_at', { ascending: false })
          .limit(1);

        const fallbackStats = {
          balance: balanceData || 0,
          pnlToday: Math.round(pnlToday * 100) / 100,
          openSignals: openSignals || 0,
          totalTrades: totalTrades || 0,
          winRate: Math.round(winRate * 100) / 100,
          lastDeposit: lastDepositData?.[0]?.amount || 0,
        };

        return NextResponse.json({
          success: true,
          data: fallbackStats,
        });
        
      } catch (fallbackError) {
        console.error('Fallback stats calculation failed:', fallbackError);
        
        // Return default values if database isn't set up
        const defaultStats = {
          balance: 0,
          pnlToday: 0,
          openSignals: 0,
          totalTrades: 0,
          winRate: 0,
          lastDeposit: 0,
        };

        return NextResponse.json({
          success: true,
          data: defaultStats,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
