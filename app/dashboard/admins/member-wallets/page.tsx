'use client';

import { requireAdmin } from '@/lib/admin';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getAllClerkUsers } from '@/lib/clerk-users';

export default function MemberWalletsPage() {
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [balanceFilter, setBalanceFilter] = useState<string>('All Balances');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [memberWallets, setMemberWallets] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Note: In a real implementation, you'd fetch this data from an API route
        // For now, using mock data structure
        setMemberWallets([]);
        setRecentTransactions([]);
      } catch (error) {
        console.error('Error fetching member wallets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter member wallets based on current filter state
  const filteredMemberWallets = memberWallets.filter(wallet => {
    const matchesStatus = statusFilter === 'All Statuses' || wallet.status === statusFilter;
    const matchesBalance = balanceFilter === 'All Balances' || 
      (balanceFilter === '$0 - $1,000' && wallet.balance >= 0 && wallet.balance <= 1000) ||
      (balanceFilter === '$1,000 - $10,000' && wallet.balance > 1000 && wallet.balance <= 10000) ||
      (balanceFilter === '$10,000+' && wallet.balance > 10000);
    const matchesSearch = searchTerm === '' || 
      wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesBalance && matchesSearch;
  });
  const walletOverview = {
    totalBalance: 0, // Will be calculated from real data
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    frozenFunds: 0
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Member <span className="gradient-text">Wallets</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              View and manage all member wallet activities and transactions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/admin/dashboard">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 grid-cols-1">
            <Input 
              placeholder="Search by email or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="border border-border rounded-md px-3 py-2 bg-background text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Restricted</option>
              <option>Frozen</option>
            </select>
            <select 
              className="border border-border rounded-md px-3 py-2 bg-background text-foreground"
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
            >
              <option>All Balances</option>
              <option>$0 - $1,000</option>
              <option>$1,000 - $10,000</option>
              <option>$10,000+</option>
            </select>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Overview Stats */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">${walletOverview.totalBalance.toLocaleString()}</p>
                <p className="text-xs text-green-400">All member wallets</p>
              </div>
              <Wallet className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Deposits</p>
                <p className="text-2xl font-bold text-foreground">${walletOverview.pendingDeposits.toLocaleString()}</p>
                <p className="text-xs text-yellow-400">Awaiting processing</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-foreground">${walletOverview.pendingWithdrawals.toLocaleString()}</p>
                <p className="text-xs text-blue-400">Awaiting approval</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frozen Funds</p>
                <p className="text-2xl font-bold text-foreground">${walletOverview.frozenFunds.toLocaleString()}</p>
                <p className="text-xs text-red-400">Under investigation</p>
              </div>
              <AlertCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Wallets Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            Member Wallets
          </CardTitle>
          <CardDescription>
            Overview of all member wallet balances and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pending</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Verification</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Activity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberWallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b border-border/30 hover:bg-accent/5">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-foreground">{wallet.name}</div>
                        <div className="text-sm text-muted-foreground">{wallet.user}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">${wallet.balance.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {wallet.pendingDeposit > 0 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <ArrowDownLeft className="h-3 w-3" />
                            +${wallet.pendingDeposit.toLocaleString()}
                          </div>
                        )}
                        {wallet.pendingWithdrawal > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-400">
                            <ArrowUpRight className="h-3 w-3" />
                            -${wallet.pendingWithdrawal.toLocaleString()}
                          </div>
                        )}
                        {wallet.pendingDeposit === 0 && wallet.pendingWithdrawal === 0 && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={
                        wallet.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        wallet.status === 'restricted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/10 text-red-400 border-red-500/30'
                      }>
                        {wallet.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={
                        wallet.verification === 'verified' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }>
                        {wallet.verification}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{wallet.lastActivity}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest deposit and withdrawal activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'deposit' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`}>
                    {transaction.type === 'deposit' ?
                      <ArrowDownLeft className="h-4 w-4 text-green-400" /> :
                      <ArrowUpRight className="h-4 w-4 text-blue-400" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {transaction.user}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.method} • {transaction.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                    <Badge variant="outline" className={
                      transaction.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}