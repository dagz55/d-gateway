import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spark from '@/components/charts/Spark';
import OpenPositions from '@/components/Tables/OpenPositions';
import StatusDot from '@/components/ui/StatusDot';
import ZigTradesWorkflow from '@/components/dashboard/ZigTradesWorkflow';
import DashboardSidePanel from '@/components/dashboard/DashboardSidePanel';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MemberDashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const firstName = user.firstName || 'Trader';

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] p-4">
      {/* Main Content */}
      <div className="flex-1 space-y-8 overflow-y-auto">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="glass-admin-panel rounded-2xl p-8 glass-hover">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                Welcome back, <span className="admin-gradient-text">{firstName}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Live <span className="admin-gradient-text font-semibold">signals</span>, portfolio insights, and market alerts
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-accent">
              <div className="glass-card rounded-xl p-4 glass-hover">
                <div className="flex items-end space-x-1 mb-2">
                  {[20, 35, 25, 45, 60, 40, 55].map((height, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-primary to-accent animate-pulse rounded-full"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-sm font-mono text-center">
                  <div className="text-accent font-semibold">--</div>
                  <div className="text-muted-foreground">Live Signals</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZigTrades Workflow Section */}
        <ZigTradesWorkflow />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="glass-card glass-hover card-glow-hover border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <StatusDot status="neutral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold admin-gradient-text">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Connect your trading account to view portfolio</p>
              <div className="h-20 mt-3 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No data available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover card-glow-hover border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
              <StatusDot status="neutral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold admin-gradient-text">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Start trading to track profits</p>
              <div className="h-20 mt-3 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No data available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover card-glow-hover border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <StatusDot status="neutral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold admin-gradient-text">--</div>
              <p className="text-xs text-muted-foreground mt-1">No trades completed yet</p>
              <div className="h-20 mt-3 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No data available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover card-glow-hover border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
              <StatusDot status="neutral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold admin-gradient-text">0</div>
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
            <Card className="glass-card glass-hover card-glow-hover border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="admin-gradient-text">Open Positions</CardTitle>
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
            <Card className="glass-card glass-hover card-glow-hover border-border/50">
              <CardHeader>
                <CardTitle className="text-lg admin-gradient-text">Top Performer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No trading data available</p>
                  <p className="text-sm text-muted-foreground">Connect your trading account to view performance</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Signals */}
            <Card className="glass-card glass-hover card-glow-hover border-border/50">
              <CardHeader>
                <CardTitle className="text-lg admin-gradient-text">Recent Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No signals available</p>
                  <p className="text-sm text-muted-foreground">Subscribe to our premium plans to receive trading signals</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-96 h-full">
        <DashboardSidePanel />
      </div>
    </div>
  );
}