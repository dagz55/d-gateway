'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Shield,
  Server,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
}

interface SystemHealth {
  database: HealthStatus;
  authentication: HealthStatus;
  storage: HealthStatus;
  api: HealthStatus;
  overall: 'healthy' | 'warning' | 'error';
}

interface SystemHealthCardProps {
  systemHealth: SystemHealth;
}

export function SystemHealthCard({ systemHealth }: SystemHealthCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const services = [
    {
      name: 'Database',
      status: systemHealth.database.status,
      message: systemHealth.database.message,
      icon: Database,
    },
    {
      name: 'Authentication',
      status: systemHealth.authentication.status,
      message: systemHealth.authentication.message,
      icon: Shield,
    },
    {
      name: 'Storage',
      status: systemHealth.storage.status,
      message: systemHealth.storage.message,
      icon: Server,
    },
    {
      name: 'API',
      status: systemHealth.api.status,
      message: systemHealth.api.message,
      icon: Server,
    },
  ];

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-accent" />
          System Health
        </CardTitle>
        <CardDescription>
          Monitor the status of all platform services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.overall)}
              <div>
                <p className="font-medium">Overall Status</p>
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(systemHealth.overall)}>
              {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
            </Badge>
          </div>

          {/* Individual Services */}
          <div className="space-y-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/20"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.message}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
