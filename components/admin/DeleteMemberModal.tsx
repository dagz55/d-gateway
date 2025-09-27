'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Trash2,
  User,
  AlertTriangle,
  Shield,
  Users,
  Database,
  Undo2
} from 'lucide-react';

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
  status?: 'active' | 'inactive' | 'suspended';
}

interface DeleteMemberModalProps {
  member: MemberData | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (userId: string) => Promise<void>;
}

export default function DeleteMemberModal({ member, isOpen, onClose, onDelete }: DeleteMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [understanding, setUnderstanding] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  if (!member) return null;

  const handleDelete = async () => {
    if (!confirmed || !understanding) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(member.user_id);

      // Show success message with undo option
      setShowUndo(true);
      toast.success('Member deleted successfully', {
        description: 'Member account has been archived but data is retained.',
        duration: 10000,
        action: {
          label: 'Undo',
          onClick: handleUndo
        }
      });

      onClose();
      resetState();
    } catch (error) {
      toast.error('Failed to delete member');
      console.error('Error deleting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    // This would typically call an API to restore the member
    toast.info('Undo functionality would restore the member account');
    setShowUndo(false);
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setConfirmed(false);
    setUnderstanding(false);
    setShowUndo(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeleteEnabled = confirmed && understanding;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-sm border-border/50 max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-white">
            <Trash2 className="h-5 w-5 text-red-400" />
            Delete Member Account
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 max-h-[calc(85vh-140px)] overflow-y-scroll overflow-x-hidden modal-scrollbar">
          <div className="space-y-6 pt-4">
          {/* Member Info */}
          <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg border border-border/30">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-border/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-white font-semibold text-lg">{member.full_name}</h4>
              <p className="text-gray-400">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={member.is_admin ? "default" : "secondary"} className="text-xs">
                  {member.is_admin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Member
                    </>
                  )}
                </Badge>
                <Badge
                  variant={member.status === 'active' ? "default" : "secondary"}
                  className="text-xs"
                >
                  {member.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Warning Message */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Permanent Account Deletion</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              This action will permanently delete the member's account access. However, their data will be archived for compliance and historical purposes.
            </p>
            <div className="bg-red-500/5 p-3 rounded border border-red-500/20">
              <p className="text-red-200 text-sm">
                <strong>Warning:</strong> The member will lose all access to their account immediately.
              </p>
            </div>
          </div>

          {/* Member Details Summary */}
          <div className="space-y-3">
            <h6 className="text-white font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Account Summary
            </h6>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Registration Date:</span>
                <span className="text-white">{formatDate(member.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-white">
                  {member.last_sign_in_at ? formatDate(member.last_sign_in_at) : 'Never'}
                </span>
              </div>
              {member.active_trades !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Trades:</span>
                  <span className="text-white">{member.active_trades}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-xs">{member.user_id}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Confirmation Checkboxes */}
          <div className="space-y-4">
            <h6 className="text-white font-medium">Confirmation Required</h6>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-delete"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="confirm-delete"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  I confirm that I want to delete this member's account access.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="understand-consequences"
                  checked={understanding}
                  onCheckedChange={(checked) => setUnderstanding(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="understand-consequences"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  I understand this action will immediately block the member's access and that member data will be archived (soft delete).
                </label>
              </div>
            </div>
          </div>

          {/* Data Retention Notice */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Database className="h-4 w-4" />
              <span className="font-medium text-sm">Data Retention Policy</span>
            </div>
            <p className="text-gray-300 text-xs">
              Member data will be archived but not permanently deleted. An undo option will be available for a limited time after deletion.
            </p>
          </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-transparent border-border/50 text-gray-300 hover:bg-card/20"
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            disabled={!isDeleteEnabled || isLoading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}