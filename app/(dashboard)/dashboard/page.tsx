import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spark from '@/components/charts/Spark';
import OpenPositions from '@/components/Tables/OpenPositions';
import StatusDot from '@/components/ui/StatusDot';
import ZigTradesWorkflow from '@/components/dashboard/ZigTradesWorkflow';
import { getCurrentUser } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/');
    }

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

      {/* Stats Overview */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        {/* Portfolio Value */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$0.00</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">No data available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Signals Performance */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signals Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">--</div>
              <div className="text-sm text-muted-foreground">No signals yet</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">0</div>
              <div className="text-sm text-muted-foreground">No positions</div>
            </div>
          </CardContent>
        </Card>

        {/* Today's P&L */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$0.00</div>
              <div className="text-sm text-muted-foreground">No data available</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {/* Signals Card */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-foreground">Live Signals</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">No signals available</p>
              <p className="text-sm text-muted-foreground mt-2">Live trading signals will appear here when available.</p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Chart */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No portfolio data</p>
              <p className="text-sm text-muted-foreground mt-2">Portfolio growth will be tracked here once you start trading.</p>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No alerts</p>
              <p className="text-sm text-muted-foreground mt-2">Market alerts and notifications will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions - Full Width */}
      <div className="w-full">
        <OpenPositions />
      </div>

      {/* ZIG TRADES Workflow - Full Width */}
      <div className="w-full">
        <ZigTradesWorkflow />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {/* Watchlist */}
        <Card className="lg:col-span-2 glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No watchlist items</p>
              <p className="text-sm text-muted-foreground mt-2">Add cryptocurrencies to your watchlist to track their performance.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-2">Your trading activity will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    console.warn('WorkOS auth error in dashboard page:', error);
    redirect('/');
  }
}