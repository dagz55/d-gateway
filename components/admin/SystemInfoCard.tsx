'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  Clock,
  Package,
  Globe,
  Shield,
  Activity,
  Info,
} from 'lucide-react';

interface SystemInfo {
  version: string;
  environment: string;
  databaseVersion: string;
  lastBackup: string;
  uptime: string;
  memoryUsage: string;
  diskUsage: string;
  activeUsers: number;
}

interface SystemInfoCardProps {
  systemInfo: SystemInfo;
}

export function SystemInfoCard({ systemInfo }: SystemInfoCardProps) {
  const infoItems = [
    {
      key: 'version',
      label: 'Platform Version',
      value: systemInfo.version,
      icon: Package,
      badge: systemInfo.environment,
    },
    {
      key: 'environment',
      label: 'Environment',
      value: systemInfo.environment,
      icon: Globe,
    },
    {
      key: 'databaseVersion',
      label: 'Database',
      value: systemInfo.databaseVersion,
      icon: Database,
    },
    {
      key: 'lastBackup',
      label: 'Last Backup',
      value: systemInfo.lastBackup,
      icon: Clock,
    },
    {
      key: 'uptime',
      label: 'Uptime',
      value: systemInfo.uptime,
      icon: Activity,
    },
    {
      key: 'memoryUsage',
      label: 'Memory Usage',
      value: systemInfo.memoryUsage,
      icon: Server,
    },
    {
      key: 'diskUsage',
      label: 'Disk Usage',
      value: systemInfo.diskUsage,
      icon: Server,
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      value: systemInfo.activeUsers.toString(),
      icon: Shield,
    },
  ];

  const getEnvironmentColor = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'staging':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          System Information
        </CardTitle>
        <CardDescription>
          Platform version, environment, and system metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/20"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
                {item.badge && (
                  <Badge className={getEnvironmentColor(item.badge)}>
                    {item.badge}
                  </Badge>
                )}
              </div>
            );
          })}
          
          {/* System Status */}
          <div className="mt-6 p-4 rounded-lg bg-card/50 border border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-4 w-4 text-green-500" />
              <p className="font-medium text-sm">System Status</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPU Usage:</span>
                <span className="text-green-400">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Load Average:</span>
                <span className="text-green-400">0.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network I/O:</span>
                <span className="text-green-400">Normal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cache Hit Rate:</span>
                <span className="text-green-400">98.2%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
