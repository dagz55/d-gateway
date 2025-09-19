'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  User,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface RecentActivityItem {
  id: string;
  type: 'user' | 'transaction' | 'trade' | 'package';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  change?: number;
}

interface AdminRecentActivityProps {
  recentActivity: RecentActivityItem[];
}

export function AdminRecentActivity({ recentActivity }: AdminRecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return User;
      case 'transaction':
        return DollarSign;
      case 'trade':
        return TrendingUp;
      case 'package':
        return Package;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-500';
      case 'transaction':
        return 'text-green-500';
      case 'trade':
        return 'text-orange-500';
      case 'package':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest platform activity and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as users interact with the platform</p>
            </div>
          ) : (
            recentActivity.slice(0, 10).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30 hover:bg-card/70 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-background ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {activity.status && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      )}
                      
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                      
                      {activity.change !== undefined && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          activity.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(activity.change)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {recentActivity.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/member-activity">
                <Eye className="h-4 w-4 mr-2" />
                View All Activity
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}