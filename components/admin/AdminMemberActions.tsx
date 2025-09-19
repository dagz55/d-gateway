'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  Shield,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  active_trades?: number;
}

interface AdminMemberActionsProps {
  member: MemberData;
}

export default function AdminMemberActions({ member }: AdminMemberActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleViewMember = () => {
    // Navigate to member details page
    window.location.href = `/admin/members/${member.user_id}`;
  };

  const handleEditMember = () => {
    // Navigate to member edit page
    window.location.href = `/admin/members/${member.user_id}/edit`;
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const action = member.last_sign_in_at ? 'suspend' : 'activate';

      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to update member status');
      }

      toast.success(`Member ${action === 'activate' ? 'activated' : 'suspended'} successfully`);

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast.error('Failed to update member status');
      console.error('Error updating member status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteToAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'promote' })
      });

      if (!response.ok) {
        throw new Error('Failed to promote member to admin');
      }

      toast.success('Member promoted to admin successfully');

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast.error('Failed to promote member to admin');
      console.error('Error promoting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!confirm(`Are you sure you want to delete ${member.email}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      toast.success('Member deleted successfully');

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete member');
      console.error('Error deleting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-border/50 bg-background/95 backdrop-blur-sm">
        
        <DropdownMenuItem onClick={handleViewMember} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleEditMember} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit Member
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        {!member.is_admin && (
          <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
            {member.last_sign_in_at ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Suspend Member
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate Member
              </>
            )}
          </DropdownMenuItem>
        )}
        
        {!member.is_admin && (
          <DropdownMenuItem onClick={handlePromoteToAdmin} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            Promote to Admin
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        {!member.is_admin && (
          <DropdownMenuItem 
            onClick={handleDeleteMember} 
            className="cursor-pointer text-red-400 focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Member
          </DropdownMenuItem>
        )}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}