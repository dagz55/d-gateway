import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock dashboard stats for development
    const mockStats = {
      balance: 1250.75,
      pnlToday: 45.20,
      openSignals: 3,
      totalTrades: 127,
      winRate: 68.5,
      lastDeposit: 500.00,
    };

    return NextResponse.json({
      success: true,
      data: mockStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
