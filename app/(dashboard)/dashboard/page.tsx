import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spark from '@/components/charts/Spark';
import OpenPositions from '@/components/Tables/OpenPositions';
import StatusDot from '@/components/ui/StatusDot';
import ZigTradesWorkflow from '@/components/dashboard/ZigTradesWorkflow';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { Signal } from '@/types';

export const dynamic = 'force-dynamic';

async function getRecentSignals(limit: number = 3): Promise<Signal[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('issued_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching signals:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      pair: row.pair,
      action: row.action === 'HOLD' ? 'BUY' : row.action,
      entry: row.target_price,
      sl: row.stop_loss ?? 0,
      tp: (row as any).take_profits ?? [],
      issuedAt: row.issued_at,
      status: row.status,
    }));
  } catch (error) {
    console.error('Error fetching recent signals:', error);
    return [];
  }
}

export default async function DashboardPage() {
  // Note: Auth is already checked in the layout, so we can proceed directly
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const recentSignals = await getRecentSignals(3);

  const firstName = user.firstName || 'Trader';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Welcome back, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Live <span className="gradient-text font-semibold">signals</span>, portfolio insights, and market alerts
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-accent">
            <div className="flex items-end space-x-1">
              {[20, 35, 25, 45, 60, 40, 55].map((height, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-primary to-accent animate-pulse"
                  style={{
                    height: `${height}px`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-sm font-mono">
              <div className="text-accent font-semibold">--</div>
              <div className="text-muted-foreground">Live Signals</div>
            </div>
          </div>
        </div>
      </div>

      {/* ZigTrades Workflow Section */}
      <ZigTradesWorkflow />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <StatusDot status="neutral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Connect your trading account to view portfolio</p>
            <div className="h-20 mt-3 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No data available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
            <StatusDot status="neutral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Start trading to track profits</p>
            <div className="h-20 mt-3 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No data available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <StatusDot status="neutral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">No trades completed yet</p>
            <div className="h-20 mt-3 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No data available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <StatusDot status="neutral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Subscribe to receive signals</p>
            <div className="h-20 mt-3 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No data available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Open Positions - Left Side */}
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Open Positions</CardTitle>
                <StatusDot status="success" />
              </div>
            </CardHeader>
            <CardContent>
              <OpenPositions />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Trading Info */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Top Performer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No trading data available</p>
                <p className="text-sm text-muted-foreground">Connect your trading account to view performance</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSignals.length > 0 ? recentSignals.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      signal.action === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {signal.action}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{signal.pair}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(signal.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-mono">${signal.entry.toLocaleString()}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent signals available</p>
                  <p className="text-xs mt-1">Signals will appear here once they are generated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}