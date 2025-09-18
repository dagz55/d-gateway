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


export default function DashboardPage() {
  return (
    <div className="space-y-8">
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$0.00</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  No data available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signals Performance */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Signals Performance
              </CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">--</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  No signals yet
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Positions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">0</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  No positions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's P&L */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's P&L
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$0.00</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  No data available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {/* Live Signals */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-foreground">Live Signals</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-400">Inactive</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No signals available</p>
              <p className="text-sm text-muted-foreground mt-2">Live trading signals will appear here when available.</p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Growth */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No portfolio data</p>
              <p className="text-sm text-muted-foreground mt-2">Portfolio growth will be tracked here once you start trading.</p>
            </div>
          </CardContent>
        </Card>

        {/* Market Alerts */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Market Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts</p>
              <p className="text-sm text-muted-foreground mt-2">Market alerts and notifications will appear here.</p>
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
          <div className="text-center py-8">
            <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No watchlist items</p>
            <p className="text-sm text-muted-foreground mt-2">Add cryptocurrencies to your watchlist to track their performance.</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button className="h-16 glass glass-hover border-border/50 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all duration-300">
          <div className="text-center">
            <div className="font-semibold text-foreground">View All Signals</div>
            <div className="text-sm text-muted-foreground">No signals</div>
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
  );
}