import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Database,
  FileText,
  Shield,
  Bell
} from 'lucide-react';
import Link from 'next/link';

export default function AdminQuickActions() {
  const quickActions = [
    {
      title: 'Create Trading Signal',
      description: 'Add a new trading signal',
      icon: TrendingUp,
      href: '/admin/signals/create',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Invite New Member',
      description: 'Send invitation to join',
      icon: UserPlus,
      href: '/admin/members/invite',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Process Withdrawals',
      description: 'Review pending requests',
      icon: DollarSign,
      href: '/admin/finances/withdrawals',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'System Settings',
      description: 'Configure platform',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      title: 'Database Backup',
      description: 'Create data backup',
      icon: Database,
      href: '/admin/database/backup',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    },
    {
      title: 'Generate Report',
      description: 'Export analytics data',
      icon: FileText,
      href: '/admin/reports',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    },
    {
      title: 'Manage Admins',
      description: 'Admin permissions',
      icon: Shield,
      href: '/admin/admins',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      title: 'Send Notification',
      description: 'Broadcast to all users',
      icon: Bell,
      href: '/admin/notifications/create',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10'
    }
  ];

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used admin tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-card/50 transition-all duration-200 group"
                >
                  <div className={`p-3 rounded-xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">
                      {action.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}