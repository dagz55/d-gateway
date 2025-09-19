import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Filter,
  Eye,
  Clock,
  Activity,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getClerkUserStats, getAllClerkUsers } from '@/lib/clerk-users';

export default async function MemberActivityPage() {
  // Require admin authentication
  const adminUser = await requireAdmin();

  // Create Supabase client and get user stats
  const supabase = await createServerSupabaseClient();
  const userStats = await getClerkUserStats();

  // Fetch real activity data
  const [
    { data: recentTrades },
    { data: recentTransactions }
  ] = await Promise.all([
    supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // Get Clerk users for mapping user IDs to names
  const clerkUsers = await getAllClerkUsers();
  const userMap = new Map(clerkUsers.map(user => [user.id, user]));

  // Combine activities
  const recentActivities = [
    ...(recentTrades?.map(trade => {
      const user = userMap.get(trade.user_id);
      return {
        id: `trade-${trade.id}`,
        user: user?.email || 'Unknown User',
        name: user?.fullName || 'Unknown User',
        action: `${trade.side} ${trade.pair}`,
        timestamp: new Date(trade.created_at).toLocaleString(),
        type: 'trade'
      };
    }) || []),
    ...(recentTransactions?.map(transaction => {
      const user = userMap.get(transaction.user_id);
      return {
        id: `transaction-${transaction.id}`,
        user: user?.email || 'Unknown User',
        name: user?.fullName || 'Unknown User',
        action: `${transaction.type} ${transaction.currency}`,
        timestamp: new Date(transaction.created_at).toLocaleString(),
        type: 'transaction'
      };
    }) || [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Member <span className="gradient-text">Activity</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor all member activities and behaviors in real-time
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
            <Input placeholder="Search by email or name..." />
            <select className="border border-border rounded-md px-3 py-2 bg-background text-foreground">
              <option>All Activities</option>
              <option>Login</option>
              <option>Trade</option>
              <option>Deposit</option>
              <option>Withdrawal</option>
              <option>Profile Update</option>
            </select>
            <select className="border border-border rounded-md px-3 py-2 bg-background text-foreground">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
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
                <p className="text-sm font-medium text-muted-foreground">Recent Trades</p>
                <p className="text-2xl font-bold text-foreground">{recentTrades?.length || 0}</p>
                <p className="text-xs text-blue-400">Last 10 trades</p>
              </div>
              <Activity className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Trades</p>
                <p className="text-2xl font-bold text-foreground">{recentTrades?.filter(t => t.status === 'OPEN').length || 0}</p>
                <p className="text-xs text-yellow-400">Open positions</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{recentTransactions?.length || 0}</p>
                <p className="text-xs text-green-400">Recent activity</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest member activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Device</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-border/30 hover:bg-accent/5">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-foreground">{activity.name}</div>
                        <div className="text-sm text-muted-foreground">{activity.user}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={
                        activity.type === 'trade' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-green-500/10 text-green-400 border-green-500/30'
                      }>
                        {activity.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{activity.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Web Browser</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">N/A</span>
                      </div>
                    </td>
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

      {/* Activity Summary */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Activity Summary
          </CardTitle>
          <CardDescription>
            Summary of member activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 grid-cols-1">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <div>
                  <div className="font-medium text-foreground">Recent Trades</div>
                  <div className="text-sm text-muted-foreground">Trading activity</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{recentTrades?.length || 0}</div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <div>
                  <div className="font-medium text-foreground">Transactions</div>
                  <div className="text-sm text-muted-foreground">Financial activity</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{recentTransactions?.length || 0}</div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full" />
                <div>
                  <div className="font-medium text-foreground">Total Members</div>
                  <div className="text-sm text-muted-foreground">Registered users</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{userStats.totalUsers}</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}