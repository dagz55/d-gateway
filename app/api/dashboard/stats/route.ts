import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getCurrentUser } from '@/lib/clerk-auth';

export async function GET(request: NextRequest) {
  try {
    // ZIG-004: Replace hardcoded stats with Supabase integration
    // Check if feature flag is enabled (default to true for now)
    const enableRealStats = process.env.ENABLE_REAL_STATS !== 'false';
    
    if (!enableRealStats) {
      // Return empty stats if feature is disabled
      const emptyStats = {
        balance: 0,
        pnlToday: 0,
        openSignals: 0,
        totalTrades: 0,
        winRate: 0,
        lastDeposit: 0,
      };

      return NextResponse.json({
        success: true,
        data: emptyStats,
        message: 'Real stats feature disabled - connect your trading account to view real stats'
      });
    }

    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();
    
    // Fetch user's stats from multiple tables
    const [transactionsResult, tradesResult, signalsResult] = await Promise.allSettled([
      // Get transaction data
      supabase
        .from('transactions')
        .select('amount, type, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'COMPLETED'),
      
      // Get trading data
      supabase
        .from('trades')
        .select('entry_price, exit_price, quantity, status, created_at, updated_at')
        .eq('user_id', user.id),
      
      // Get signals data
      supabase
        .from('signals')
        .select('status, created_at')
        .eq('user_id', user.id)
    ]);

    // Handle missing data gracefully with fallback zeros
    const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];
    const trades = tradesResult.status === 'fulfilled' ? tradesResult.value.data || [] : [];
    const signals = signalsResult.status === 'fulfilled' ? signalsResult.value.data || [] : [];

    // Calculate balance from completed transactions
    const deposits = transactions.filter(t => t.type === 'DEPOSIT');
    const withdrawals = transactions.filter(t => t.type === 'WITHDRAWAL');
    const balance = deposits.reduce((sum, t) => sum + t.amount, 0) - 
                   withdrawals.reduce((sum, t) => sum + t.amount, 0);

    // Calculate today's P&L
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = trades.filter(t => 
      t.status === 'COMPLETED' && 
      new Date(t.updated_at) >= today
    );
    const pnlToday = todayTrades.reduce((sum, trade) => {
      if (trade.exit_price && trade.entry_price) {
        return sum + ((trade.exit_price - trade.entry_price) * trade.quantity);
      }
      return sum;
    }, 0);

    // Count open signals
    const openSignals = signals.filter(s => s.status === 'ACTIVE').length;

    // Count total trades
    const totalTrades = trades.length;

    // Calculate win rate with division by zero protection
    const completedTrades = trades.filter(t => t.status === 'COMPLETED');
    const winningTrades = completedTrades.filter(trade => {
      if (trade.exit_price && trade.entry_price) {
        return (trade.exit_price - trade.entry_price) > 0;
      }
      return false;
    });
    const winRate = completedTrades.length > 0 ? 
      (winningTrades.length / completedTrades.length) * 100 : 0;

    // Get last deposit amount
    const lastDeposit = deposits.length > 0 ? 
      deposits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].amount : 0;

    const stats = {
      balance: Math.round(balance * 100) / 100,
      pnlToday: Math.round(pnlToday * 100) / 100,
      openSignals,
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      lastDeposit: Math.round(lastDeposit * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Real user stats retrieved successfully'
    });
  } catch (error) {
    // Dashboard stats error - removed console.error to reduce noise
    
    // Return fallback zeros on error
    const fallbackStats = {
      balance: 0,
      pnlToday: 0,
      openSignals: 0,
      totalTrades: 0,
      winRate: 0,
      lastDeposit: 0,
    };

    return NextResponse.json({
      success: false,
      data: fallbackStats,
      message: 'Error retrieving stats, showing fallback data'
    }, { status: 500 });
  }
}
