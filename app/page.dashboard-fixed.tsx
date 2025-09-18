'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Settings,
  Database,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  LayoutDashboard,
  History,
  Signal,
  Wallet,
  Newspaper,
  Copy
} from 'lucide-react';

// Mock dashboard data
const mockUser = {
  firstName: 'John',
  email: 'john@example.com'
};

const mockAdminUser = {
  display_name: 'Admin User',
  admin_permissions: ['users', 'signals', 'finance']
};

function DashboardDemo() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Welcome back, <span className="gradient-text">{mockUser.firstName}</span>
            </h1>
            <p className="text-xl text-white/90">
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
              <div className="text-white/70">Live Signals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        {/* Portfolio Value */}
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">$12,450.00</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">+5.2%</span>
                <span className="text-white/60 text-sm">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Signals Performance */}
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70">Signals Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">87%</div>
              <div className="text-sm text-green-400">Success Rate</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-sm text-white/70">Open trades</div>
            </div>
          </CardContent>
        </Card>

        {/* Today's P&L */}
        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Today's P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">+$234.50</div>
              <div className="text-sm text-green-400">+1.9%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {/* Signals Card */}
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-white">Live Signals</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">BTC/USDT</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">BUY</Badge>
                </div>
                <div className="text-sm text-white/60">Entry: $43,250 | Target: $45,000</div>
              </div>
              <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">ETH/USDT</span>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">SELL</Badge>
                </div>
                <div className="text-sm text-white/60">Entry: $2,650 | Target: $2,500</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Chart */}
        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end space-x-2">
              {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-accent to-primary rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-white/70 text-sm">30-day performance</p>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Market Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">BTC approaching resistance</p>
                  <p className="text-white/60 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">ETH target reached</p>
                  <p className="text-white/60 text-xs">5 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDemo() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-white/90">
              Welcome back, <span className="text-accent font-semibold">{mockAdminUser.display_name}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
            <Badge variant="outline" className="text-accent border-accent/30">
              {mockAdminUser.admin_permissions.length} Permissions
            </Badge>
          </div>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">1,247</div>
              <div className="text-sm text-green-400">+12 this week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Active Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">23</div>
              <div className="text-sm text-white/70">Live now</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">$45,230</div>
              <div className="text-sm text-green-400">+8.2% this month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card dashboard-card-hover border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">89.5%</div>
              <div className="text-sm text-green-400">Above target</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        
        {/* Members Management */}
        <Card className="dashboard-card dashboard-card-hover border-white/20 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">
                Members Management
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">View All</div>
              <div className="text-sm text-white/70">
                Manage user accounts, roles & permissions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Signals */}
        <Card className="dashboard-card dashboard-card-hover border-white/20 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">
                Trading Signals
              </CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">Manage</div>
              <div className="text-sm text-white/70">
                Create, edit & monitor trading signals
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Management */}
        <Card className="dashboard-card dashboard-card-hover border-white/20 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">
                Financial Management
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">Overview</div>
              <div className="text-sm text-white/70">
                Deposits, withdrawals & transactions
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* System Status */}
      <Card className="dashboard-card dashboard-card-hover border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            <span className="text-white">System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Auth Service</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">API Gateway</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white">Trading Signals</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default function DashboardFixedDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-12">
        {/* Dashboard Demo */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Fixed Dashboard</h2>
            <p className="text-white/70">Improved readability and contrast</p>
          </div>
          <AppLayout>
            <DashboardDemo />
          </AppLayout>
        </section>
        
        {/* Admin Demo */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Fixed Admin Panel</h2>
            <p className="text-white/70">Better visibility and sidebar functionality</p>
          </div>
          <AppLayout>
            <AdminDemo />
          </AppLayout>
        </section>
      </div>
    </div>
  );
}