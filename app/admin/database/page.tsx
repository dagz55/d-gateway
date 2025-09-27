import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Server, HardDrive, Activity, Users, Settings, RefreshCw, Download, Upload } from 'lucide-react';

export default async function AdminDatabasePage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for database tables and stats
  const tables = [
    {
      name: 'users',
      records: 1247,
      size: '2.3 MB',
      lastUpdated: '2024-01-15T10:30:00Z',
      status: 'healthy'
    },
    {
      name: 'packages',
      records: 12,
      size: '0.1 MB',
      lastUpdated: '2024-01-15T09:15:00Z',
      status: 'healthy'
    },
    {
      name: 'payments',
      records: 3456,
      size: '5.7 MB',
      lastUpdated: '2024-01-15T11:45:00Z',
      status: 'healthy'
    },
    {
      name: 'user_profiles',
      records: 1189,
      size: '3.2 MB',
      lastUpdated: '2024-01-15T10:20:00Z',
      status: 'healthy'
    },
    {
      name: 'trading_signals',
      records: 89,
      size: '0.8 MB',
      lastUpdated: '2024-01-15T08:30:00Z',
      status: 'healthy'
    },
    {
      name: 'audit_logs',
      records: 15678,
      size: '12.4 MB',
      lastUpdated: '2024-01-15T12:00:00Z',
      status: 'healthy'
    }
  ];

  const databaseStats = {
    totalSize: '24.5 MB',
    totalRecords: 22671,
    connectionStatus: 'Connected',
    uptime: '99.9%',
    lastBackup: '2024-01-15T02:00:00Z',
    nextBackup: '2024-01-16T02:00:00Z'
  };

  const recentQueries = [
    {
      id: 1,
      query: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL 24 HOUR',
      duration: '45ms',
      rows: 23,
      timestamp: '2024-01-15T12:15:00Z'
    },
    {
      id: 2,
      query: 'UPDATE packages SET price = $1 WHERE id = $2',
      duration: '12ms',
      rows: 1,
      timestamp: '2024-01-15T12:10:00Z'
    },
    {
      id: 3,
      query: 'SELECT COUNT(*) FROM payments WHERE status = "completed"',
      duration: '8ms',
      rows: 1,
      timestamp: '2024-01-15T12:05:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
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
            <h1 className="text-3xl font-bold text-white gradient-text">Database Manager</h1>
            <p className="text-white/60 mt-2">Monitor and manage database operations and performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-transparent border-accent/30 text-accent hover:bg-accent/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              Database Settings
            </Button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Size</p>
                  <p className="text-2xl font-bold text-white">{databaseStats.totalSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Records</p>
                  <p className="text-2xl font-bold text-white">{databaseStats.totalRecords.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Uptime</p>
                  <p className="text-2xl font-bold text-white">{databaseStats.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Last Backup</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(databaseStats.lastBackup).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Tables */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" />
              Database Tables
            </CardTitle>
            <CardDescription>
              Monitor table sizes, record counts, and health status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className="glass-subtle rounded-xl p-6 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-white">
                        {table.name}
                      </div>
                      <Badge className={getStatusColor(table.status)}>
                        {table.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      Last updated: {new Date(table.lastUpdated).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Records</p>
                      <p className="text-lg font-semibold text-white">
                        {table.records.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Size</p>
                      <p className="text-lg font-semibold text-white">
                        {table.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Recent Queries
            </CardTitle>
            <CardDescription>
              Monitor recent database queries and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div
                  key={query.id}
                  className="glass-subtle rounded-xl p-4 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-mono text-white/80 bg-black/20 px-3 py-1 rounded">
                      {query.query}
                    </div>
                    <div className="text-xs text-white/60">
                      {new Date(query.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <span>Duration: {query.duration}</span>
                    <span>Rows: {query.rows}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Actions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              Database Actions
            </CardTitle>
            <CardDescription>
              Perform maintenance and administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Download className="w-6 h-6" />
                <span>Backup Database</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Upload className="w-6 h-6" />
                <span>Restore Database</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6" />
                <span>Optimize Tables</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Activity className="w-6 h-6" />
                <span>Query Analyzer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
