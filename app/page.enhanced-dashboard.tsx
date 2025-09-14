'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Bell,
  Settings,
  Menu,
  Search
} from 'lucide-react';

// Mock data for the enhanced dashboard
const mockStats = [
  {
    title: "Portfolio Value",
    value: "$11,400",
    change: "+14.0%",
    changeValue: "+$1,400",
    icon: DollarSign,
    positive: true
  },
  {
    title: "Signals Performance",
    value: "+24.7%",
    change: "Last 30 days",
    changeValue: "8 active",
    icon: Activity,
    positive: true
  },
  {
    title: "Active Positions",
    value: "8",
    change: "3 profitable",
    changeValue: "5 pending",
    icon: BarChart3,
    positive: true
  },
  {
    title: "Today's P&L",
    value: "+$247",
    change: "+2.2%",
    changeValue: "vs yesterday",
    icon: TrendingUp,
    positive: true
  }
];

const mockSignals = [
  { symbol: 'BTC/USDT', action: 'BUY', price: '$46,500', confidence: 92, time: '2m ago' },
  { symbol: 'ETH/USDT', action: 'SELL', price: '$3,150', confidence: 87, time: '5m ago' },
  { symbol: 'SOL/USDT', action: 'BUY', price: '$98', confidence: 94, time: '8m ago' },
];

const mockWatchlist = [
  { symbol: 'BTC/USDT', price: 46500, change: 2.4, volume: '1.2B' },
  { symbol: 'ETH/USDT', price: 3150, change: -1.2, volume: '890M' },
  { symbol: 'SOL/USDT', price: 98, change: 5.8, volume: '245M' },
  { symbol: 'ADA/USDT', price: 0.45, change: 0.8, volume: '156M' },
];

const mockAlerts = [
  { message: 'BTC price target reached', severity: 'success', time: '2m ago' },
  { message: 'ETH resistance level broken', severity: 'warning', time: '5m ago' },
  { message: 'SOL volume spike detected', severity: 'info', time: '8m ago' },
];

export default function EnhancedDashboardPage() {
  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-white">Z</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Zignal</h1>
                  <p className="text-xs text-muted-foreground">Trading Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="glass-hover">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="glass-hover">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="glass-hover">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                Welcome back, <span className="gradient-text">Trader</span>
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
          {mockStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass glass-hover card-glow-hover border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.changeValue}
                      </span>
                      <span className="text-muted-foreground text-sm">({stat.change})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
          {/* Live Signals */}
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
                {mockSignals.map((signal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-hover transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={signal.action === 'BUY' ? 'default' : 'secondary'}
                        className={signal.action === 'BUY' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}
                      >
                        {signal.action}
                      </Badge>
                      <div>
                        <div className="font-medium text-foreground">{signal.symbol}</div>
                        <div className="text-sm text-muted-foreground">{signal.price}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-accent">{signal.confidence}%</div>
                      <div className="text-xs text-muted-foreground">{signal.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Performance */}
          <Card className="glass glass-hover card-glow-hover border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">$11,400</div>
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">+14.0% (+$1,400)</span>
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground mb-1">Initial</div>
                    <div className="font-medium text-foreground">$10,000</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground mb-1">Peak</div>
                    <div className="font-medium text-foreground">$11,650</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Alerts */}
          <Card className="glass glass-hover card-glow-hover border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Market Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass-hover transition-all duration-300">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'success' ? 'bg-green-400' :
                      alert.severity === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Watchlist */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mockWatchlist.map((item, index) => (
                <div key={index} className="p-4 rounded-xl glass-hover transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {item.symbol}
                    </div>
                    <div className={`flex items-center space-x-1 text-sm ${
                      item.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      <span>{Math.abs(item.change)}%</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    ${item.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Vol: {item.volume}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-16 glass glass-hover border-border/50 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all duration-300">
            <div className="text-center">
              <div className="font-semibold text-foreground">View All Signals</div>
              <div className="text-sm text-muted-foreground">8 active signals</div>
            </div>
          </Button>
          
          <Button className="h-16 glass glass-hover border-border/50 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300">
            <div className="text-center">
              <div className="font-semibold text-foreground">Deposit Funds</div>
              <div className="text-sm text-muted-foreground">Add to portfolio</div>
            </div>
          </Button>
          
          <Button className="h-16 glass glass-hover border-border/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300">
            <div className="text-center">
              <div className="font-semibold text-foreground">Trading History</div>
              <div className="text-sm text-muted-foreground">View all trades</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}