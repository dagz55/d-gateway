'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminMemberSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
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
          
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-border/30 hover:border-accent/50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
        </div>
      </CardContent>
    </Card>
  );
}