'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  UserCheck,
  UserX,
  User,
  AlertTriangle,
  CheckCircle
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

interface ActivateMemberModalProps {
  member: MemberData | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (userId: string, action: 'activate' | 'deactivate' | 'suspend') => Promise<void>;
}

export default function ActivateMemberModal({ member, isOpen, onClose, onActivate }: ActivateMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'activate' | 'deactivate' | 'suspend' | null>(null);

  if (!member) return null;

  const currentStatus = member.status || (member.last_sign_in_at ? 'active' : 'inactive');
  const isCurrentlyActive = currentStatus === 'active';
  const isCurrentlySuspended = currentStatus === 'suspended';

  const handleAction = async (action: 'activate' | 'deactivate' | 'suspend') => {
    setSelectedAction(action);
  };

  const confirmAction = async () => {
    if (!selectedAction || !member) return;

    setIsLoading(true);
    try {
      await onActivate(member.user_id, selectedAction);

      const actionMessages = {
        activate: 'Member activated successfully',
        deactivate: 'Member deactivated successfully',
        suspend: 'Member suspended successfully'
      };

      toast.success(actionMessages[selectedAction]);
      onClose();
      setSelectedAction(null);
    } catch (error) {
      toast.error(`Failed to ${selectedAction} member`);
      console.error(`Error ${selectedAction} member:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAction = () => {
    setSelectedAction(null);
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, color: "text-green-400", icon: CheckCircle },
      inactive: { variant: "secondary" as const, color: "text-gray-400", icon: UserX },
      suspended: { variant: "destructive" as const, color: "text-red-400", icon: AlertTriangle }
    };

    const config = variants[status as keyof typeof variants] || variants.inactive;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={cancelAction}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/50 max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-white">
            <User className="h-5 w-5" />
            {selectedAction ? 'Confirm Action' : 'Manage Member Status'}
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
                className="w-12 h-12 rounded-full object-cover border-2 border-border/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-white font-medium">{member.full_name}</h4>
              <p className="text-gray-400 text-sm">{member.email}</p>
              <div className="mt-2">
                {getStatusBadge(currentStatus)}
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {!selectedAction ? (
            /* Action Selection */
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Select an action to change this member's account status:
              </p>
              <div className="space-y-3">
                {!isCurrentlyActive && (
                  <Button
                    onClick={() => handleAction('activate')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                  >
                    <UserCheck className="h-4 w-4 mr-3" />
                    Activate Member
                    <span className="ml-auto text-green-200 text-xs">Enable account access</span>
                  </Button>
                )}

                {isCurrentlyActive && (
                  <Button
                    onClick={() => handleAction('deactivate')}
                    variant="outline"
                    className="w-full bg-transparent border-border/50 text-gray-300 hover:bg-card/20 justify-start"
                  >
                    <UserX className="h-4 w-4 mr-3" />
                    Deactivate Member
                    <span className="ml-auto text-gray-400 text-xs">Disable account access</span>
                  </Button>
                )}

                {!isCurrentlySuspended && (
                  <Button
                    onClick={() => handleAction('suspend')}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <AlertTriangle className="h-4 w-4 mr-3" />
                    Suspend Member
                    <span className="ml-auto text-red-200 text-xs">Temporarily block access</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Confirmation */
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Confirm Action</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Are you sure you want to <strong>{selectedAction}</strong> this member?
                  {selectedAction === 'suspend' && ' This will immediately block their access to the platform.'}
                  {selectedAction === 'deactivate' && ' This will disable their account access.'}
                  {selectedAction === 'activate' && ' This will restore their account access.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Member:</span>
                <span className="text-white font-medium">{member.full_name}</span>
                <span className="text-gray-400">({member.email})</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 flex gap-3">
          <Button
            variant="outline"
            onClick={selectedAction ? () => setSelectedAction(null) : cancelAction}
            disabled={isLoading}
            className="bg-transparent border-border/50 text-gray-300 hover:bg-card/20"
          >
            {selectedAction ? 'Back' : 'Cancel'}
          </Button>

          {selectedAction && (
            <Button
              onClick={confirmAction}
              disabled={isLoading}
              className={
                selectedAction === 'activate'
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : selectedAction === 'suspend'
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {selectedAction === 'activate' && <UserCheck className="h-4 w-4 mr-2" />}
                  {selectedAction === 'deactivate' && <UserX className="h-4 w-4 mr-2" />}
                  {selectedAction === 'suspend' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  Confirm {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}