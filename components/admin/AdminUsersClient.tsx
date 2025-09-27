'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils/formatting';
import { 
  Users, 
  Calendar,
  Activity,
  Mail,
  Search,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import AdminMemberActions from '@/components/admin/AdminMemberActions';

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

interface ApiResponse {
  success: boolean;
  data: {
    items: MemberData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export default function AdminUsersClient() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Fetch members from API
  const fetchMembers = async (searchQuery: string = '', currentPage: number = 1) => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.set('page', String(currentPage));
      url.searchParams.set('limit', String(limit));
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        let errorMessage = `Failed to fetch members. Status: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (e) {
          // Response is not JSON, use the raw text
          const textBody = await response.text();
          errorMessage = textBody || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to process member data');
      }

      setMembers(data.data.items);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch (error: any) {
      console.error('Error fetching members:', error.stack || error);
      toast.error(error.message || 'An unexpected error occurred while fetching members.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchMembers(searchTerm, 1);
  };

  // Debounced filter change handler
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = useCallback((newSearchTerm: string) => {
    setPage(1);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchMembers(newSearchTerm, 1);
    }, 500); // 500ms debounce delay
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
    fetchMembers('', 1);
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMembers(searchTerm, newPage);
  };

  // Client-side filtering for role and status (since API doesn't support these yet)
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => {
        if (roleFilter === 'admin') return member.is_admin;
        if (roleFilter === 'user') return !member.is_admin;
        if (roleFilter === 'moderator') return member.role === 'moderator';
        return true;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => {
        const isActive = member.last_sign_in_at && 
          new Date(member.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        if (statusFilter === 'active') return isActive;
        if (statusFilter === 'inactive') return !isActive;
        if (statusFilter === 'suspended') return member.role === 'suspended';
        return true;
      });
    }

    return filtered;
  }, [members, roleFilter, statusFilter]);

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

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-8 admin-users-client">
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
              {total} Total Members
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 bg-card/50 border-border/30 focus:border-accent"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="min-w-[150px]">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50 bg-background/95 backdrop-blur-sm">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="min-w-[150px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50 bg-background/95 backdrop-blur-sm">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="border-border/30 hover:border-accent/50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="border-border/30 hover:border-accent/50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            
          </div>
        </CardContent>
      </Card>

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
            
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No members found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {hasActiveFilters ? 'Try adjusting your search or filters' : 'Members will appear here when they register'}
                </p>
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
                   {filteredMembers.map((member) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} members
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

