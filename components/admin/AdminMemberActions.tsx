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

// Import modal components
import ViewDetailsModal from './ViewDetailsModal';
import EditMemberModal from './EditMemberModal';
import ActivateMemberModal from './ActivateMemberModal';
import PromoteToAdminModal from './PromoteToAdminModal';
import DeleteMemberModal from './DeleteMemberModal';

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
  phone?: string;
  wallet_balance?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

interface AdminMemberActionsProps {
  member: MemberData;
}

export default function AdminMemberActions({ member }: AdminMemberActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();

  // Modal handlers
  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // API handlers for modals
  const handleEditSave = async (updatedMember: Partial<MemberData>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: updatedMember
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAction = async (userId: string, action: 'activate' | 'deactivate' | 'suspend') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} member`);
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteAction = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'promote' })
      });

      if (!response.ok) {
        throw new Error('Failed to promote member to admin');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAction = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="admin-dashboard glass border-border/50 bg-background/95 backdrop-blur-sm min-w-[180px]"
          sideOffset={5}
        >

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openModal('view');
            }}
            className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/50 transition-colors duration-150 px-3 py-2.5 mx-1 my-0.5 rounded-md"
          >
            <span className="flex items-center w-full">
              <Eye className="mr-3 h-4 w-4 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-foreground">View Details</span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openModal('edit');
            }}
            className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/50 transition-colors duration-150 px-3 py-2.5 mx-1 my-0.5 rounded-md"
          >
            <span className="flex items-center w-full">
              <Edit className="mr-3 h-4 w-4 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-foreground">Edit Member</span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          {!member.is_admin && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openModal('activate');
              }}
              className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/50 transition-colors duration-150 px-3 py-2.5 mx-1 my-0.5 rounded-md"
            >
              <span className="flex items-center w-full">
                <UserCheck className="mr-3 h-4 w-4 flex-shrink-0 text-foreground" />
                <span className="flex-1 text-foreground">Activate Member</span>
              </span>
            </DropdownMenuItem>
          )}

          {!member.is_admin && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openModal('promote');
              }}
              className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/50 transition-colors duration-150 px-3 py-2.5 mx-1 my-0.5 rounded-md"
            >
              <span className="flex items-center w-full">
                <Shield className="mr-3 h-4 w-4 flex-shrink-0 text-foreground" />
                <span className="flex-1 text-foreground">Promote to Admin</span>
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          {!member.is_admin && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openModal('delete');
              }}
              className="cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 transition-colors duration-150 px-3 py-2.5 mx-1 my-0.5 rounded-md"
            >
              <span className="flex items-center w-full">
                <Trash2 className="mr-3 h-4 w-4 flex-shrink-0 text-red-400" />
                <span className="flex-1 text-red-400">Delete Member</span>
              </span>
            </DropdownMenuItem>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Components */}
      <ViewDetailsModal
        member={member}
        isOpen={activeModal === 'view'}
        onClose={closeModal}
      />

      <EditMemberModal
        member={member}
        isOpen={activeModal === 'edit'}
        onClose={closeModal}
        onSave={handleEditSave}
      />

      <ActivateMemberModal
        member={member}
        isOpen={activeModal === 'activate'}
        onClose={closeModal}
        onActivate={handleActivateAction}
      />

      <PromoteToAdminModal
        member={member}
        isOpen={activeModal === 'promote'}
        onClose={closeModal}
        onPromote={handlePromoteAction}
      />

      <DeleteMemberModal
        member={member}
        isOpen={activeModal === 'delete'}
        onClose={closeModal}
        onDelete={handleDeleteAction}
      />
    </>
  );
}