'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  Settings,
  Eye,
  Wallet,
  Plus,
  Shield,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export function AdminQuickActions() {
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Member Activity',
      description: 'Monitor user activity and engagement',
      icon: Activity,
      href: '/admin/member-activity',
      color: 'text-green-500',
    },
    {
      title: 'Package Management',
      description: 'Create and manage subscription packages',
      icon: Package,
      href: '/admin/packages',
      color: 'text-purple-500',
    },
    {
      title: 'Member Wallets',
      description: 'Monitor wallet transactions and balances',
      icon: Wallet,
      href: '/admin/member-wallets',
      color: 'text-orange-500',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-500',
    },
  ];

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common administrative tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start gap-3 hover:bg-accent/5 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
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