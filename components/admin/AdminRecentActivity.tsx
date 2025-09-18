import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  Users, 
  UserPlus, 
  Settings, 
  Shield,
  DollarSign,
  TrendingUp,
  Edit
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

interface AdminActivity {
  id: string;
  admin_user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: any;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
}

async function getAdminActivity(): Promise<AdminActivity[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get recent admin activity
    const { data: activities } = await supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin_profile:user_profiles!admin_user_id (
          full_name,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!activities) return [];
    
    return activities.map(activity => ({
      ...activity,
      admin_name: activity.admin_profile?.display_name || activity.admin_profile?.full_name,
      admin_email: activity.admin_profile?.email
    }));
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    
    // Return placeholder data for development
    return [
      {
        id: '1',
        admin_user_id: 'admin-1',
        action: 'User Login',
        target_type: 'user',
        target_id: 'user-123',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        admin_name: 'Admin',
        admin_email: 'admin@zignals.org'
      },
      {
        id: '2',
        admin_user_id: 'admin-1',
        action: 'Created Trading Signal',
        target_type: 'signal',
        target_id: 'signal-456',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        admin_name: 'Admin',
        admin_email: 'admin@zignals.org'
      },
      {
        id: '3',
        admin_user_id: 'admin-1',
        action: 'Member Registered',
        target_type: 'user',
        target_id: 'user-789',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        admin_name: 'Admin',
        admin_email: 'admin@zignals.org'
      }
    ];
  }
}

export default async function AdminRecentActivity() {
  const activities = await getAdminActivity();
  
  const getActivityIcon = (action: string, targetType?: string) => {
    if (action.toLowerCase().includes('login')) return Users;
    if (action.toLowerCase().includes('register')) return UserPlus;
    if (action.toLowerCase().includes('signal')) return TrendingUp;
    if (action.toLowerCase().includes('deposit') || action.toLowerCase().includes('withdrawal')) return DollarSign;
    if (action.toLowerCase().includes('edit') || action.toLowerCase().includes('update')) return Edit;
    if (action.toLowerCase().includes('admin') || action.toLowerCase().includes('promote')) return Shield;
    if (action.toLowerCase().includes('settings')) return Settings;
    return Activity;
  };

  const getActivityColor = (action: string) => {
    if (action.toLowerCase().includes('login')) return 'text-green-400';
    if (action.toLowerCase().includes('register')) return 'text-blue-400';
    if (action.toLowerCase().includes('signal')) return 'text-purple-400';
    if (action.toLowerCase().includes('deposit')) return 'text-emerald-400';
    if (action.toLowerCase().includes('withdrawal')) return 'text-orange-400';
    if (action.toLowerCase().includes('edit')) return 'text-yellow-400';
    if (action.toLowerCase().includes('delete')) return 'text-red-400';
    if (action.toLowerCase().includes('admin')) return 'text-red-400';
    return 'text-accent';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest admin actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-2">Admin activities will appear here</p>
            </div>
          ) : (
            activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.action, activity.target_type);
              const colorClass = getActivityColor(activity.action);
              
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-200"
                >
                  <div className={`p-2 rounded-full bg-card/50 ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      {activity.target_type && (
                        <Badge variant="outline" className="text-xs">
                          {activity.target_type}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        by {activity.admin_name || 'Unknown Admin'}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent/10 text-accent text-xs">
                        {(activity.admin_name || activity.admin_email || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}