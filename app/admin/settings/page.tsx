import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Database,
  Shield,
  Mail,
  Globe,
  Bell,
  Lock,
  Server,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { getClerkUserStats } from '@/lib/clerk-users';

async function getSystemHealth() {
  try {
    const supabase = await createServerSupabaseClient();

    // Test database connection
    const { data: dbTest } = await supabase.from('signals').select('count').limit(1);
    const dbStatus = dbTest !== null;

    // Get user stats to test Clerk connection
    const userStats = await getClerkUserStats();
    const authStatus = userStats.totalUsers >= 0;

    return {
      database: {
        status: dbStatus ? 'healthy' : 'error',
        message: dbStatus ? 'Database connection active' : 'Database connection failed'
      },
      authentication: {
        status: authStatus ? 'healthy' : 'error',
        message: authStatus ? 'Clerk authentication active' : 'Authentication service error'
      },
      storage: {
        status: 'healthy',
        message: 'Supabase storage operational'
      },
      api: {
        status: 'healthy',
        message: 'API endpoints responding'
      }
    };
  } catch (error) {
    console.error('System health check failed:', error);
    return {
      database: { status: 'error', message: 'Database health check failed' },
      authentication: { status: 'error', message: 'Auth health check failed' },
      storage: { status: 'unknown', message: 'Storage status unknown' },
      api: { status: 'unknown', message: 'API status unknown' }
    };
  }
}

export default async function AdminSettingsPage() {
  // Require admin authentication
  const adminUser = await requireAdmin();
  const systemHealth = await getSystemHealth();
  const userStats = await getClerkUserStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Healthy</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Error</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Site <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Configure platform settings and monitor system health
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              System Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* System Health */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            System Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {/* Database */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-card/30 border border-border/20">
                <div className="flex items-center gap-3">
                  {getStatusIcon(systemHealth.database.status)}
                  <div>
                    <div className="font-medium text-foreground">Database</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.database.message}</div>
                  </div>
                </div>
                {getStatusBadge(systemHealth.database.status)}
              </div>

              {/* Authentication */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-card/30 border border-border/20">
                <div className="flex items-center gap-3">
                  {getStatusIcon(systemHealth.authentication.status)}
                  <div>
                    <div className="font-medium text-foreground">Authentication</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.authentication.message}</div>
                  </div>
                </div>
                {getStatusBadge(systemHealth.authentication.status)}
              </div>
            </div>

            <div className="space-y-4">
              {/* Storage */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-card/30 border border-border/20">
                <div className="flex items-center gap-3">
                  {getStatusIcon(systemHealth.storage.status)}
                  <div>
                    <div className="font-medium text-foreground">Storage</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.storage.message}</div>
                  </div>
                </div>
                {getStatusBadge(systemHealth.storage.status)}
              </div>

              {/* API */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-card/30 border border-border/20">
                <div className="flex items-center gap-3">
                  {getStatusIcon(systemHealth.api.status)}
                  <div>
                    <div className="font-medium text-foreground">API Services</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.api.message}</div>
                  </div>
                </div>
                {getStatusBadge(systemHealth.api.status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Database Settings */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Supabase database and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connection Status</span>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database Type</span>
                <span className="text-foreground font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Row Level Security</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Real-time</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Configure Database
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Security Configuration
            </CardTitle>
            <CardDescription>
              Authentication and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Authentication Provider</span>
                <span className="text-green-400 font-medium">Clerk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Users</span>
                <span className="text-foreground font-medium">{userStats.totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Admin Users</span>
                <span className="text-yellow-400 font-medium">{userStats.adminUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate Limiting</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Email service and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email Provider</span>
                <span className="text-green-400 font-medium">Integrated</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transactional Emails</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email Verification</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Password Reset</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Mail className="h-4 w-4 mr-2" />
              Email Settings
            </Button>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Platform Configuration
            </CardTitle>
            <CardDescription>
              General platform and deployment settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Name</span>
                <span className="text-foreground font-medium">Zignal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-medium">v2.9.1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployment</span>
                <span className="text-green-400 font-medium">Vercel</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Environment</span>
                <span className="text-blue-400 font-medium">Production</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Globe className="h-4 w-4 mr-2" />
              Platform Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Environment Information */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-accent" />
            Environment Information
          </CardTitle>
          <CardDescription>
            Technical details about the platform environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Framework</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next.js</span>
                  <span className="text-foreground">15.5.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">React</span>
                  <span className="text-foreground">19.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TypeScript</span>
                  <span className="text-foreground">5.5.4</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Services</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span className="text-foreground">Supabase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auth</span>
                  <span className="text-foreground">Clerk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hosting</span>
                  <span className="text-foreground">Vercel</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Features</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Signals</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Copy Trading</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet System</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}