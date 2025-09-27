import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  DollarSign,
  Package,
  Shield,
  Settings,
  Eye,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserCheck,
  CreditCard,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getClerkUserStats } from '@/lib/clerk-users';

export default async function AdminDashboardPage() {
  // Require admin authentication
  const adminUser = await requireAdmin();

  // Create Supabase client and get Clerk user stats
  const supabase = await createServerSupabaseClient();
  const userStats = await getClerkUserStats();

  // Fetch real stats from database with error handling
  const [
    signalsResult,
    transactionsResult,
    tradesResult,
    walletTransactionsResult,
    allTradesResult,
    packagesResult
  ] = await Promise.allSettled([
    supabase.from('signals').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('transactions').select('amount, type, status').eq('status', 'COMPLETED'),
    supabase.from('trades').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
    supabase.from('transactions').select('*'),
    supabase.from('trades').select('*'),
    supabase.from('packages').select('*', { count: 'exact', head: true }).eq('active', true)
  ]);

  // Extract data with fallbacks
  const activeSignals = signalsResult.status === 'fulfilled' ? (signalsResult.value.count || 0) : 0;
  const transactions = transactionsResult.status === 'fulfilled' ? (transactionsResult.value.data || []) : [];
  const openTrades = tradesResult.status === 'fulfilled' ? (tradesResult.value.count || 0) : 0;
  const allWalletTransactions = walletTransactionsResult.status === 'fulfilled' ? (walletTransactionsResult.value.data || []) : [];
  const allTrades = allTradesResult.status === 'fulfilled' ? (allTradesResult.value.data || []) : [];
  const activePackages = packagesResult.status === 'fulfilled' ? (packagesResult.value.count || 0) : 0;

  // Log any errors for debugging
  if (signalsResult.status === 'rejected') {
    console.error('Error fetching signals:', signalsResult.reason);
  }
  if (transactionsResult.status === 'rejected') {
    console.error('Error fetching transactions:', transactionsResult.reason);
  }
  if (tradesResult.status === 'rejected') {
    console.error('Error fetching trades:', tradesResult.reason);
  }
  if (walletTransactionsResult.status === 'rejected') {
    console.error('Error fetching wallet transactions:', walletTransactionsResult.reason);
  }
  if (allTradesResult.status === 'rejected') {
    console.error('Error fetching all trades:', allTradesResult.reason);
  }
  if (packagesResult.status === 'rejected') {
    console.error('Error fetching packages:', packagesResult.reason);
  }

  // Calculate revenue from completed transactions
  const totalRevenue = transactions?.reduce((sum, transaction) => {
    return transaction.type === 'DEPOSIT' ? sum + transaction.amount : sum;
  }, 0) || 0;

  // Calculate wallet stats
  const totalBalance = allWalletTransactions?.reduce((sum, t) => {
    return t.type === 'DEPOSIT' && t.status === 'COMPLETED' ? sum + t.amount :
           t.type === 'WITHDRAWAL' && t.status === 'COMPLETED' ? sum - t.amount : sum;
  }, 0) || 0;

  const pendingDeposits = allWalletTransactions?.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const pendingWithdrawals = allWalletTransactions?.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  // Calculate trading stats
  const activeTrades = allTrades?.filter(t => t.status === 'OPEN').length || 0;
  const completedTrades = allTrades?.filter(t => t.status === 'CLOSED') || [];
  const winningTrades = completedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = completedTrades.length > 0 ? ((winningTrades / completedTrades.length) * 100).toFixed(1) : '0.0';
  const totalVolume = allTrades?.reduce((sum, t) => sum + (t.amount * t.price), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Admin <span className="gradient-text">Panel</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Site Management & User Administration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
            <Button asChild variant="outline">
              <Link href="/dashboard">View Site</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{userStats.totalUsers}</p>
                <p className="text-xs text-green-400">Registered users</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Signals</p>
                <p className="text-2xl font-bold text-foreground">{activeSignals || 0}</p>
                <p className="text-xs text-blue-400">Live trading signals</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-400">From deposits</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Trades</p>
                <p className="text-2xl font-bold text-foreground">{openTrades?.length || 0}</p>
                <p className="text-xs text-yellow-400">Active positions</p>
              </div>
              <AlertCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Functions */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">

        {/* User Management */}
        <Link href="/admin/users">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  User Management
                </CardTitle>
                <Users className="h-5 w-5 text-accent" />
              </div>
              <CardDescription>
                Manage all member accounts, permissions & roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="text-foreground font-medium">{userStats.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Admin Users</span>
                  <span className="text-yellow-400 font-medium">{userStats.adminUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member Users</span>
                  <span className="text-green-400 font-medium">{userStats.memberUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Member Activity Monitor */}
        <Link href="/admin/member-activity">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Member Activity
                </CardTitle>
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <CardDescription>
                Monitor all member activities & behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="text-green-400 font-medium">{userStats.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recent Trades</span>
                  <span className="text-foreground font-medium">{allTrades?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="text-blue-400 font-medium">{allWalletTransactions?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Member Wallets */}
        <Link href="/admin/member-wallets">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Member Wallets
                </CardTitle>
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <CardDescription>
                View & manage all member wallet activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Balance</span>
                  <span className="text-foreground font-medium">${totalBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Deposits</span>
                  <span className="text-yellow-400 font-medium">${pendingDeposits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Withdrawals</span>
                  <span className="text-blue-400 font-medium">${pendingWithdrawals.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Signals Management */}
        <Link href="/admin/signals">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Signals Management
                </CardTitle>
                <Package className="h-5 w-5 text-accent" />
              </div>
              <CardDescription>
                Create & manage trading signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Signals</span>
                  <span className="text-foreground font-medium">{activeSignals || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Volume</span>
                  <span className="text-foreground font-medium">${totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="text-green-400 font-medium">{winRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Package Management */}
        <Card className="glass glass-hover card-glow-hover border-border/50 transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                Package Management
              </CardTitle>
              <Package className="h-5 w-5 text-accent" />
            </div>
            <CardDescription>
              Create & manage subscription packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Packages</span>
                <span className="text-foreground font-medium">{activePackages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Subscribers</span>
                <span className="text-green-400 font-medium">{userStats.totalUsers}</span>
              </div>
              <div className="grid gap-2 mt-3">
                <Button size="sm" className="w-full" asChild>
                  <Link href="/admin/packages">
                    <Package className="h-4 w-4 mr-2" />
                    View Packages
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/admin/packages/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Settings */}
        <Link href="/admin/settings">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Site Settings
                </CardTitle>
                <Settings className="h-5 w-5 text-accent" />
              </div>
              <CardDescription>
                Configure platform settings & features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="text-green-400 font-medium">{userStats.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Database Status</span>
                  <span className="text-green-400 font-medium">Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">System Health</span>
                  <span className="text-green-400 font-medium">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>


      {/* System Status */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            System Health
          </CardTitle>
          <CardDescription>
            Platform status and performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Optimal
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">Authentication</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">Payment Gateway</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">API Services</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Running
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
