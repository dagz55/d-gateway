'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Mail,
  Globe,
  Bell,
  Lock,
  Activity,
  Edit,
  Save,
} from 'lucide-react';

interface PlatformConfigCardProps {
  platformConfig: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    twoFactorAuth: boolean;
  };
}

export function PlatformConfigCard({ platformConfig }: PlatformConfigCardProps) {
  const configItems = [
    {
      key: 'siteName',
      label: 'Site Name',
      value: platformConfig.siteName,
      icon: Globe,
      type: 'text',
    },
    {
      key: 'siteDescription',
      label: 'Site Description',
      value: platformConfig.siteDescription,
      icon: Globe,
      type: 'text',
    },
    {
      key: 'supportEmail',
      label: 'Support Email',
      value: platformConfig.supportEmail,
      icon: Mail,
      type: 'email',
    },
    {
      key: 'maintenanceMode',
      label: 'Maintenance Mode',
      value: platformConfig.maintenanceMode ? 'Enabled' : 'Disabled',
      icon: Settings,
      type: 'boolean',
    },
    {
      key: 'registrationEnabled',
      label: 'Registration',
      value: platformConfig.registrationEnabled ? 'Enabled' : 'Disabled',
      icon: Activity,
      type: 'boolean',
    },
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      value: platformConfig.emailNotifications ? 'Enabled' : 'Disabled',
      icon: Bell,
      type: 'boolean',
    },
    {
      key: 'smsNotifications',
      label: 'SMS Notifications',
      value: platformConfig.smsNotifications ? 'Enabled' : 'Disabled',
      icon: Bell,
      type: 'boolean',
    },
    {
      key: 'twoFactorAuth',
      label: '2FA Required',
      value: platformConfig.twoFactorAuth ? 'Enabled' : 'Disabled',
      icon: Lock,
      type: 'boolean',
    },
  ];

  const getBooleanColor = (value: string) => {
    return value === 'Enabled' 
      ? 'bg-green-500/10 text-green-400 border-green-500/30'
      : 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" />
          Platform Configuration
        </CardTitle>
        <CardDescription>
          Manage global platform settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {configItems.map((item) => {
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
                    {item.type === 'text' && (
                      <p className="text-xs text-muted-foreground">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.type === 'boolean' ? (
                    <Badge className={getBooleanColor(item.value)}>
                      {item.value}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {item.value}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          <div className="flex gap-2 pt-4 border-t border-border/30">
            <Button size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
