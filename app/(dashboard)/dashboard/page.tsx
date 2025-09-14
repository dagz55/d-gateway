import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spark from '@/components/charts/Spark';
import OpenPositions from '@/components/Tables/OpenPositions';
import StatusDot from '@/components/ui/StatusDot';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Mock data for demonstration
const mockSignalsData = [45, 52, 38, 65, 72, 58, 68, 75, 82, 78, 85, 92];
const mockPortfolioData = [10000, 10250, 10100, 10350, 10500, 10400, 10650, 10800, 10950, 11100, 11250, 11400];

const mockAlerts = [
  { id: '1', message: 'BTC price target reached', severity: 'success', time: '2m ago' },
  { id: '2', message: 'ETH resistance level broken', severity: 'info', time: '5m ago' },
  { id: '3', message: 'SOL volume spike detected', severity: 'warning', time: '8m ago' },
  { id: '4', message: 'Market volatility high', severity: 'error', time: '12m ago' },
];

const mockActivity = [
  { id: '1', action: 'Login', time: '2 minutes ago', type: 'auth' },
  { id: '2', action: 'Buy BTC 0.5', time: '1 hour ago', type: 'trade' },
  { id: '3', action: 'Deposit $1000', time: '3 hours ago', type: 'deposit' },
  { id: '4', action: 'Sell ETH 2.0', time: '5 hours ago', type: 'trade' },
  { id: '5', action: 'Withdraw $500', time: '1 day ago', type: 'withdrawal' },
];

const mockWatchlist = [
  { symbol: 'BTC/USDT', price: 46500, change: 2.4, sparkData: [45, 52, 38, 65, 72, 58, 68, 75] },
  { symbol: 'ETH/USDT', price: 3150, change: -1.2, sparkData: [38, 42, 35, 48, 52, 45, 50, 48] },
  { symbol: 'SOL/USDT', price: 98, change: 5.8, sparkData: [85, 88, 82, 90, 95, 92, 98, 96] },
  { symbol: 'ADA/USDT', price: 0.45, change: 0.8, sparkData: [42, 44, 41, 43, 45, 44, 46, 45] },
];

export default async function DashboardPage() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/');
    }

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Trader';

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
              <div className="text-accent font-semibold">+24.7%</div>
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
              <div className="text-3xl font-bold text-foreground">$11,400</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">+$1,400</span>
                <span className="text-muted-foreground text-sm">(+14.0%)</span>
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
              <div className="text-3xl font-bold gradient-text">+24.7%</div>
              <div className="text-sm text-muted-foreground">Last 30 days</div>
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
              <div className="text-3xl font-bold text-foreground">8</div>
              <div className="text-sm text-green-400">3 profitable</div>
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
              <div className="text-3xl font-bold text-green-400">+$247</div>
              <div className="text-sm text-muted-foreground">+2.2%</div>
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
            <div className="space-y-4">
              <Spark data={mockSignalsData} height={60} width={200} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Performance</span>
                <span className="text-accent font-medium">+24.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Chart */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Spark data={mockPortfolioData} height={60} width={200} />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Initial</div>
                  <div className="font-medium text-foreground">$10,000</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current</div>
                  <div className="font-medium text-foreground">$11,400</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <StatusDot 
                    status={alert.severity as 'success' | 'warning' | 'error' | 'info'} 
                    size="sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions - Full Width */}
      <div className="w-full">
        <OpenPositions />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {/* Watchlist */}
        <Card className="lg:col-span-2 glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockWatchlist.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between p-4 rounded-xl glass-hover transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-8">
                      <Spark data={item.sparkData} height={32} width={64} />
                    </div>
                    <div>
                      <div className="font-medium text-foreground group-hover:text-accent transition-colors">{item.symbol}</div>
                      <div className="text-sm text-muted-foreground">${item.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${item.change >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <StatusDot 
                    status={activity.type === 'trade' ? 'info' : activity.type === 'deposit' ? 'success' : 'neutral'} 
                    size="sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    console.warn('Supabase auth error in dashboard page:', error);
    redirect('/');
  }
}