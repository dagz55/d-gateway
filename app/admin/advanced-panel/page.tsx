import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings, Database, Shield, BarChart3, Users, CreditCard, Activity, Server, Key, AlertTriangle, CheckCircle } from 'lucide-react';

export default async function AdminAdvancedPanelPage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for advanced panel
  const systemHealth = {
    status: 'HEALTHY',
    uptime: '99.9%',
    responseTime: '45ms',
    memoryUsage: '68%',
    cpuUsage: '23%',
    diskUsage: '45%',
    lastBackup: '2024-01-15T02:00:00Z',
    nextMaintenance: '2024-01-22T02:00:00Z'
  };

  const systemModules = [
    {
      name: 'Authentication System',
      status: 'ACTIVE',
      version: '2.1.4',
      lastUpdate: '2024-01-10T10:30:00Z',
      uptime: '99.8%',
      description: 'Clerk-based authentication and user management'
    },
    {
      name: 'Payment Processing',
      status: 'ACTIVE',
      version: '1.8.2',
      lastUpdate: '2024-01-12T14:20:00Z',
      uptime: '99.9%',
      description: 'PayPal integration and payment link management'
    },
    {
      name: 'Database Layer',
      status: 'ACTIVE',
      version: '3.0.1',
      lastUpdate: '2024-01-08T09:15:00Z',
      uptime: '99.95%',
      description: 'Supabase database and RLS policies'
    },
    {
      name: 'Trading Signals',
      status: 'ACTIVE',
      version: '1.5.3',
      lastUpdate: '2024-01-14T16:45:00Z',
      uptime: '99.7%',
      description: 'Real-time trading signal generation and distribution'
    },
    {
      name: 'Email Service',
      status: 'WARNING',
      version: '2.0.1',
      lastUpdate: '2024-01-05T11:30:00Z',
      uptime: '98.2%',
      description: 'Transactional email and notifications'
    },
    {
      name: 'File Storage',
      status: 'ACTIVE',
      version: '1.2.0',
      lastUpdate: '2024-01-13T08:20:00Z',
      uptime: '99.9%',
      description: 'Supabase storage for user files and documents'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'WARNING',
      module: 'Email Service',
      message: 'Email delivery rate dropped to 95.2%',
      timestamp: '2024-01-15T11:30:00Z',
      resolved: false
    },
    {
      id: 2,
      type: 'INFO',
      module: 'Database Layer',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2024-01-15T10:15:00Z',
      resolved: true
    },
    {
      id: 3,
      type: 'ERROR',
      module: 'Payment Processing',
      message: 'PayPal API timeout - 3 failed requests',
      timestamp: '2024-01-15T09:45:00Z',
      resolved: true
    },
    {
      id: 4,
      type: 'SUCCESS',
      module: 'Authentication System',
      message: 'Security update applied successfully',
      timestamp: '2024-01-15T08:20:00Z',
      resolved: true
    }
  ];

  const systemMetrics = [
    { name: 'API Requests/min', value: 1247, trend: '+12%', color: 'text-green-400' },
    { name: 'Database Queries/min', value: 3456, trend: '+8%', color: 'text-blue-400' },
    { name: 'Active Users', value: 892, trend: '+15%', color: 'text-purple-400' },
    { name: 'Error Rate', value: '0.2%', trend: '-5%', color: 'text-green-400' },
    { name: 'Cache Hit Rate', value: '94.5%', trend: '+2%', color: 'text-cyan-400' },
    { name: 'Memory Usage', value: '68%', trend: '+3%', color: 'text-yellow-400' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'WARNING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'ERROR': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'HEALTHY': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'INFO': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'SUCCESS': return 'bg-green-500/20 text-green-400 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ERROR': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'INFO': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="admin-dashboard space-y-8 p-6 dashboard-bg min-h-screen">
      {/* Enhanced backdrop with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20 pointer-events-none" />

      {/* Main content with proper z-index */}
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white gradient-text">Advanced Admin Panel</h1>
            <p className="text-white/60 mt-2">Comprehensive system monitoring and advanced administrative controls</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-transparent border-accent/30 text-accent hover:bg-accent/10">
              <Activity className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">System Status</p>
                  <p className="text-2xl font-bold text-white">{systemHealth.status}</p>
                  <div className="text-xs text-green-400">Uptime: {systemHealth.uptime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Response Time</p>
                  <p className="text-2xl font-bold text-white">{systemHealth.responseTime}</p>
                  <div className="text-xs text-green-400">Excellent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Memory Usage</p>
                  <p className="text-2xl font-bold text-white">{systemHealth.memoryUsage}</p>
                  <div className="text-xs text-yellow-400">Moderate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">CPU Usage</p>
                  <p className="text-2xl font-bold text-white">{systemHealth.cpuUsage}</p>
                  <div className="text-xs text-green-400">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Modules */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              System Modules
            </CardTitle>
            <CardDescription>
              Monitor the status and performance of all system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemModules.map((module) => (
                <div
                  key={module.name}
                  className="glass-subtle rounded-xl p-6 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-white">
                        {module.name}
                      </div>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                      <div className="text-sm text-white/60">
                        v{module.version}
                      </div>
                    </div>
                    <div className="text-sm text-white/60">
                      Last update: {new Date(module.lastUpdate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Uptime</p>
                      <p className="text-lg font-semibold text-white">
                        {module.uptime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Description</p>
                      <p className="text-sm text-white/80">
                        {module.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                      <Button variant="outline" size="sm">
                        Restart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Real-time Metrics
            </CardTitle>
            <CardDescription>
              Live system performance metrics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemMetrics.map((metric) => (
                <div key={metric.name} className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">{metric.name}</span>
                    <span className={`text-xs font-semibold ${metric.color}`}>
                      {metric.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {metric.value}
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, parseFloat(metric.value.toString().replace('%', ''))))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              System alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-subtle rounded-xl p-4 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.type)}
                      <Badge className={getStatusColor(alert.type)}>
                        {alert.type}
                      </Badge>
                      <span className="text-sm font-semibold text-white">
                        {alert.module}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/60">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      {alert.resolved ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-white/80">
                    {alert.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Actions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              Advanced Actions
            </CardTitle>
            <CardDescription>
              System maintenance and administrative operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Database className="w-6 h-6" />
                <span>Database Backup</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Server className="w-6 h-6" />
                <span>System Restart</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Shield className="w-6 h-6" />
                <span>Security Scan</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Key className="w-6 h-6" />
                <span>API Keys</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="w-6 h-6" />
                <span>Performance Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="w-6 h-6" />
                <span>User Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <CreditCard className="w-6 h-6" />
                <span>Payment Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Activity className="w-6 h-6" />
                <span>System Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
