import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Clock
} from 'lucide-react';
import AdminMemberStats from '@/components/admin/AdminMemberStats';
import AdminRecentActivity from '@/components/admin/AdminRecentActivity';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import Link from 'next/link';

export default async function AdminPage() {
  // Require admin authentication
  const adminUser = await requireAdmin();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, <span className="text-accent font-semibold">{adminUser.display_name}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
            <Badge variant="outline" className="text-accent border-accent/30">
              {adminUser.admin_permissions.length} Permissions
            </Badge>
            <Button asChild variant="outline">
              <Link href="/dashboard">Member Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <AdminMemberStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        
        {/* Members Management */}
        <Link href="/admin/users">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Members Management
                </CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">View All</div>
                <div className="text-sm text-muted-foreground">
                  Manage user accounts, roles & permissions
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Trading Signals */}
        <Link href="/admin/signals">
          <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trading Signals
                </CardTitle>
                <Activity className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">Manage</div>
                <div className="text-sm text-muted-foreground">
                  Create, edit & monitor trading signals
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Financial Management */}
        <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Financial Management
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">Overview</div>
              <div className="text-sm text-muted-foreground">
                Deposits, withdrawals & transactions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Methods
              </CardTitle>
              <CreditCard className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">Setup</div>
              <div className="text-sm text-muted-foreground">
                Crypto & bank payment options
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Settings
              </CardTitle>
              <Settings className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">Configure</div>
              <div className="text-sm text-muted-foreground">
                Platform settings & configuration
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card className="glass glass-hover card-glow-hover border-border/50 cursor-pointer transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Database
              </CardTitle>
              <Database className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">Manage</div>
              <div className="text-sm text-muted-foreground">
                Database operations & maintenance
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Testing - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="glass glass-hover card-glow-hover border-yellow-500/30 cursor-pointer transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Error Testing
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">Debug</div>
                <div className="text-sm text-muted-foreground">
                  Test error handling & fallback systems
                </div>
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link href="/admin/test-errors">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Test Error Scenarios
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* System Status */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            System Status
          </CardTitle>
          <CardDescription>
            Current platform status and health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">Auth Service</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-foreground">API Gateway</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-foreground">Trading Signals</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <AdminRecentActivity />

      {/* Quick Actions */}
      <AdminQuickActions />

    </div>
  );
}
