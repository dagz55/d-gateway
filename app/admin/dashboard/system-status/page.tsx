import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Server, Wifi, HardDrive, Cpu, MemoryStick, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function SystemStatusPage() {
  const systemServices = [
    { name: 'Database', status: 'online', uptime: '99.9%', lastCheck: '2 minutes ago', icon: Database },
    { name: 'API Server', status: 'online', uptime: '99.8%', lastCheck: '1 minute ago', icon: Server },
    { name: 'Authentication', status: 'online', uptime: '100%', lastCheck: '30 seconds ago', icon: CheckCircle },
    { name: 'File Storage', status: 'online', uptime: '99.7%', lastCheck: '5 minutes ago', icon: HardDrive },
    { name: 'Email Service', status: 'degraded', uptime: '98.5%', lastCheck: '10 minutes ago', icon: Wifi },
    { name: 'Background Jobs', status: 'online', uptime: '99.9%', lastCheck: '1 minute ago', icon: Activity },
  ];

  const systemResources = [
    { name: 'CPU Usage', value: 45, max: 100, unit: '%', status: 'good', icon: Cpu },
    { name: 'Memory Usage', value: 68, max: 100, unit: '%', status: 'warning', icon: MemoryStick },
    { name: 'Disk Usage', value: 32, max: 100, unit: '%', status: 'good', icon: HardDrive },
    { name: 'Network I/O', value: 156, max: 1000, unit: 'Mbps', status: 'good', icon: Wifi },
  ];

  const recentLogs = [
    { time: '15:04:23', level: 'INFO', message: 'Database connection pool optimized', service: 'Database' },
    { time: '15:03:45', level: 'WARN', message: 'High memory usage detected on server-02', service: 'Monitoring' },
    { time: '15:02:12', level: 'INFO', message: 'User authentication successful', service: 'Auth' },
    { time: '15:01:38', level: 'ERROR', message: 'Email delivery failed for user@example.com', service: 'Email' },
    { time: '15:00:56', level: 'INFO', message: 'Backup process completed successfully', service: 'System' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'good':
        return 'text-green-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'text-blue-400';
      case 'WARN':
        return 'text-yellow-400';
      case 'ERROR':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg">
          <Activity className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Status</h1>
          <p className="text-muted-foreground">Monitor system health, services, and logs</p>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">SYSTEM STATUS</p>
                <p className="text-xl font-bold text-white">All Systems Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-400">UPTIME</p>
                <p className="text-xl font-bold text-white">99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-purple-400">RESPONSE TIME</p>
                <p className="text-xl font-bold text-white">245ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="bg-background/50 border-border">
        <CardHeader>
          <CardTitle className="text-white">Service Status</CardTitle>
          <CardDescription>Current status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemServices.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-white">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Last checked: {service.lastCheck}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <Badge variant="outline" className={`${getStatusColor(service.status)} border-current`}>
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <Card className="bg-background/50 border-border">
        <CardHeader>
          <CardTitle className="text-white">System Resources</CardTitle>
          <CardDescription>Real-time resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemResources.map((resource) => {
              const Icon = resource.icon;
              const percentage = (resource.value / resource.max) * 100;
              return (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-white">{resource.name}</span>
                    </div>
                    <span className="text-sm text-white">{resource.value}{resource.unit}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        resource.status === 'good' ? 'bg-green-500' :
                        resource.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card className="bg-background/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5" />
            Recent System Logs
          </CardTitle>
          <CardDescription>Latest system events and messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-muted-foreground font-mono w-20 flex-shrink-0">
                  {log.time}
                </div>
                <Badge variant="outline" className={`${getLevelColor(log.level)} border-current text-xs`}>
                  {log.level}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{log.message}</p>
                  <p className="text-xs text-muted-foreground">{log.service}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}