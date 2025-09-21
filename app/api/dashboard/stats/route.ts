import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return empty stats - integrate with real user data from Supabase
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
      message: 'Connect your trading account to view real stats'
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
