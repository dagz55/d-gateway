import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

async function getMemberStats() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get member statistics
    const { data: stats } = await supabase
      .from('admin_member_stats')
      .select('*')
      .single();
    
    return stats || {
      total_members: 0,
      active_members: 0,
      inactive_members: 0,
      new_members_week: 0,
      new_members_today: 0
    };
  } catch (error) {
    console.error('Error fetching member stats:', error);
    return {
      total_members: 0,
      active_members: 0,
      inactive_members: 0,
      new_members_week: 0,
      new_members_today: 0
    };
  }
}

export default async function AdminMemberStats() {
  const stats = await getMemberStats();
  
  const activePercentage = stats.total_members > 0 
    ? Math.round((stats.active_members / stats.total_members) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-5 md:grid-cols-3 grid-cols-2">
      
      {/* Total Members */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">{stats.total_members}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                All Users
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-400">{stats.active_members}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                {activePercentage}% of total
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Members */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Members
            </CardTitle>
            <UserX className="h-4 w-4 text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-400">{stats.inactive_members}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                30+ days
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New This Week */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Week
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-400">{stats.new_members_week}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Last 7 days
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Today */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-400">{stats.new_members_today}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                Last 24h
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}