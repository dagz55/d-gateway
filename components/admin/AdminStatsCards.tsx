'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  DollarSign,
  Package,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface AdminStatsCardsProps {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    adminUsers: number;
    verifiedUsers: number;
    bannedUsers: number;
    lockedUsers: number;
  };
  activeSignals: number;
  totalRevenue: number;
  openTrades: number;
  totalTransactions: number;
  totalTrades: number;
  totalWalletTransactions: number;
}

export function AdminStatsCards({
  userStats,
  activeSignals,
  totalRevenue,
  openTrades,
  totalTransactions,
  totalTrades,
  totalWalletTransactions,
}: AdminStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* User Statistics */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {userStats.newUsersToday} new today
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {userStats.verifiedUsers} verified
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Shield className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.adminUsers}</div>
          <p className="text-xs text-muted-foreground">
            {userStats.bannedUsers} banned, {userStats.lockedUsers} locked
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSignals}</div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            From {totalTransactions} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openTrades}</div>
          <p className="text-xs text-muted-foreground">
            Out of {totalTrades} total trades
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Transactions</CardTitle>
          <Package className="h-4 w-4 text-cyan-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWalletTransactions}</div>
          <p className="text-xs text-muted-foreground">
            All time transactions
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <AlertCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
              All Systems Operational
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
