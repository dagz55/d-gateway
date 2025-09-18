import { requireAdminPermission, ADMIN_PERMISSIONS } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar,
  Activity,
  Mail,
  Shield
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import AdminMemberActions from '@/components/admin/AdminMemberActions';
import AdminMemberSearch from '@/components/admin/AdminMemberSearch';

export const dynamic = 'force-dynamic';

interface MemberData {
  user_id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  active_trades?: number;
}

async function getMembers(): Promise<MemberData[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all user profiles with auth data
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        email,
        full_name,
        display_name,
        avatar_url,
        role,
        is_admin,
        created_at,
        last_sign_in_at
      `)
      .order('created_at', { ascending: false });

    if (!profiles) return [];

    // For each profile, get additional data like active trades count
    // This would be replaced with actual queries to trading tables when available
    const membersWithStats = profiles.map(profile => ({
      ...profile,
      active_trades: Math.floor(Math.random() * 5), // Placeholder
      email_confirmed_at: profile.created_at // Placeholder
    }));

    return membersWithStats;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export default async function AdminUsersPage() {
  // Require admin permission for users management
  const adminUser = await requireAdminPermission(ADMIN_PERMISSIONS.USERS);
  const members = await getMembers();

  const getStatusBadge = (member: MemberData) => {
    if (member.is_admin) {
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Admin</Badge>;
    }
    
    const isActive = member.last_sign_in_at && 
      new Date(member.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (isActive) {
      return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>;
    }
    
    return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Members <span className="gradient-text">Management</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage user accounts, roles and permissions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Users className="h-3 w-3 mr-1" />
              {members.length} Total Members
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <AdminMemberSearch />

      {/* Members Table */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Members List
          </CardTitle>
          <CardDescription>
            View and manage all platform members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No members found</p>
                <p className="text-sm text-muted-foreground mt-2">Members will appear here when they register</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/30">
                  <div className="col-span-3">Member Info</div>
                  <div className="col-span-2">Registration Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Active Trades</div>
                  <div className="col-span-2">Username/Email</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.user_id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-200 border border-border/20"
                    >
                      {/* Member Info */}
                      <div className="col-span-3 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />
                          <AvatarFallback className="bg-accent/10 text-accent">
                            {(member.full_name || member.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {member.full_name || 'No Name'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.display_name || 'No Display Name'}
                          </div>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div className="col-span-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {formatDate(member.created_at)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Registered
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center">
                        {getStatusBadge(member)}
                      </div>

                      {/* Active Trades */}
                      <div className="col-span-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {member.active_trades || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active Trades
                          </div>
                        </div>
                      </div>

                      {/* Username/Email */}
                      <div className="col-span-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {member.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Email
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center gap-1">
                        <AdminMemberActions member={member} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

