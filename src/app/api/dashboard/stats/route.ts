import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return demo stats without authentication
    const defaultStats = {
      balance: 10000,  // Demo balance
      pnlToday: 250.50,
      openSignals: 3,
      totalTrades: 42,
      winRate: 68.5,
      lastDeposit: 1000,
    };

    return NextResponse.json({
      success: true,
      data: defaultStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
