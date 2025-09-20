import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency } from '@/lib/utils/formatting';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

// Type definitions
interface Trade {
  id: string;
  pair: string;
  action: string;
  side: string;
  entry: number;
  sl: number;
  tp: number[];
  amount: number;
  price: number;
  time: string;
  issuedAt: string;
  status: string;
  pnl?: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Signal {
  id: string;
  pair: string;
  action: string;
  entry: number;
  sl: number;
  tp: number[];
  issuedAt: string;
  issued_at: string;
  target_price: number;
  status: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

import {
  ArrowLeft,
  Users,
  Calendar,
  Mail,
  Phone,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Clock,
  Ban,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MemberDetailsData {
  user_id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
  email_verified: boolean;
  phone?: string;
  banned: boolean;
  locked: boolean;
  trades: Trade[];
  transactions: Transaction[];
  signals: Signal[];
  profile: UserProfile;
  stats: {
    total_trades: number;
    active_trades: number;
    total_volume: number;
    total_pnl: number;
    total_transactions: number;
    total_deposits: number;
    total_withdrawals: number;
    signals_received: number;
  };
}

async function getMemberDetails(userId: string): Promise<MemberDetailsData | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Get user stats (mock data for now - replace with real queries)
    const stats = {
      total_trades: 0,
      active_trades: 0,
      total_volume: 0,
      total_pnl: 0,
      total_transactions: 0,
      total_deposits: 0,
      total_withdrawals: 0,
      signals_received: 0
    };

    // Get trades (mock data for now - replace with real queries)
    const trades: Trade[] = [];

    // Get transactions (mock data for now - replace with real queries)
    const transactions: Transaction[] = [];

    // Get signals (mock data for now - replace with real queries)
    const signals: Signal[] = [];

    return {
      user_id: userId,
      email: profile.email || '',
      full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      display_name: profile.username || profile.first_name || profile.email || '',
      avatar_url: profile.avatar_url || '',
      role: profile.role || 'user',
      is_admin: profile.is_admin || false,
      created_at: profile.created_at || '',
      last_sign_in_at: profile.last_sign_in_at,
      email_verified: profile.email_verified || false,
      phone: profile.phone,
      banned: profile.banned || false,
      locked: profile.locked || false,
      trades,
      transactions,
      signals,
      profile,
      stats
    };
  } catch (error) {
    console.error('Error fetching member details:', error);
    return null;
  }
}

export default async function MemberDetailsPage({
  params
}: {
  params: { userId: string }
}) {
  // Require admin authentication
  await requireAdmin();

  const member = await getMemberDetails(params.userId);

  if (!member) {
    notFound();
  }


  const getStatusBadge = () => {
    if (member.banned) {
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Banned</Badge>;
    }
    if (member.locked) {
      return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Locked</Badge>;
    }
    if (member.is_admin) {
      return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">Admin</Badge>;
    }

    const isActive = member.last_sign_in_at &&
      new Date(member.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return isActive
      ? <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>
      : <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Inactive</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/members">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />
              <AvatarFallback className="bg-accent/10 text-accent text-2xl">
                {(member.full_name || member.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {member.full_name || 'No Name'}
              </h1>
              <p className="text-xl text-muted-foreground mb-3">
                {member.email}
              </p>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <Badge variant="outline">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                {member.email_verified && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/members/${member.user_id}/edit`}>
                Edit Member
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold text-foreground">{member.stats.total_trades}</p>
                <p className="text-xs text-blue-400">{member.stats.active_trades} active</p>
              </div>
              <Activity className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trading Volume</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(member.stats.total_volume)}</p>
                <p className="text-xs text-green-400">Total volume</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L</p>
                <p className={`text-2xl font-bold ${member.stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(member.stats.total_pnl)}
                </p>
                <p className="text-xs text-muted-foreground">Profit & Loss</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signals</p>
                <p className="text-2xl font-bold text-foreground">{member.stats.signals_received}</p>
                <p className="text-xs text-purple-400">Received</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Account Information */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="text-foreground font-mono text-sm">{member.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{member.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Display Name</span>
                    <span className="text-foreground">{member.display_name}</span>
                  </div>
                  {member.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-foreground">{member.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="text-foreground capitalize">{member.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Activity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground">{formatDate(member.created_at)}</span>
                  </div>
                  {member.last_sign_in_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Sign In</span>
                      <span className="text-foreground">{formatDate(member.last_sign_in_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified</span>
                    <span className={member.email_verified ? 'text-green-400' : 'text-red-400'}>
                      {member.email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Status</span>
                    <span className="text-foreground">
                      {member.banned ? 'Banned' : member.locked ? 'Locked' : 'Active'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Summary */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Trading Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-card/30">
                  <div className="text-2xl font-bold text-foreground">{member.stats.total_transactions}</div>
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/30">
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(member.stats.total_deposits)}</div>
                  <div className="text-sm text-muted-foreground">Total Deposits</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/30">
                  <div className="text-2xl font-bold text-red-400">{formatCurrency(member.stats.total_withdrawals)}</div>
                  <div className="text-sm text-muted-foreground">Total Withdrawals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Trading History</CardTitle>
              <CardDescription>Complete trading history for this member</CardDescription>
            </CardHeader>
            <CardContent>
              {member.trades.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No trades found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {member.trades.slice(0, 10).map((trade: Trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 rounded-lg bg-card/30">
                      <div className="flex items-center gap-4">
                        <Badge className={trade.side === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                          {trade.side}
                        </Badge>
                        <div>
                          <div className="font-medium">{trade.pair}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(trade.time)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(trade.amount * trade.price)}</div>
                        <div className="text-sm text-muted-foreground">{trade.amount} @ {formatCurrency(trade.price)}</div>
                      </div>
                      <Badge className={(trade.pnl ?? 0) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                        {(trade.pnl ?? 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl ?? 0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Deposits and withdrawals for this member</CardDescription>
            </CardHeader>
            <CardContent>
              {member.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {member.transactions.slice(0, 10).map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-card/30">
                      <div className="flex items-center gap-4">
                        <Badge className={transaction.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                          {transaction.type}
                        </Badge>
                        <div>
                          <div className="font-medium">{transaction.currency}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Signals History</CardTitle>
              <CardDescription>Trading signals received by this member</CardDescription>
            </CardHeader>
            <CardContent>
              {member.signals.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No signals found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {member.signals.slice(0, 10).map((signal: Signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-4 rounded-lg bg-card/30">
                      <div className="flex items-center gap-4">
                        <Badge className={signal.action === 'BUY' ? 'bg-green-500/10 text-green-400' : signal.action === 'SELL' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}>
                          {signal.action}
                        </Badge>
                        <div>
                          <div className="font-medium">{signal.pair}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(signal.issued_at)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(signal.target_price)}</div>
                        <Badge variant="outline" className="text-xs">
                          {signal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}