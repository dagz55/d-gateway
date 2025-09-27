'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Shield,
  User,
  AlertTriangle,
  Crown,
  Users,
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

interface PromoteToAdminModalProps {
  member: MemberData | null;
  isOpen: boolean;
  onClose: () => void;
  onPromote: (userId: string) => Promise<void>;
}

export default function PromoteToAdminModal({ member, isOpen, onClose, onPromote }: PromoteToAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!member) return null;

  const handlePromote = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setIsLoading(true);
    try {
      await onPromote(member.user_id);
      toast.success('Member promoted to admin successfully');
      onClose();
      setConfirmed(false);
    } catch (error) {
      toast.error('Failed to promote member to admin');
      console.error('Error promoting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="admin-dashboard max-w-lg bg-gray-900 border-gray-700 max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-white">
            <Shield className="h-5 w-5" />
            {confirmed ? 'Confirm Promotion' : 'Promote to Admin'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Grant admin privileges to this member.
          </DialogDescription>
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
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Member
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

          {!confirmed ? (
            /* Initial Promotion Info */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Crown className="h-6 w-6 text-yellow-400" />
                <div>
                  <h5 className="text-white font-medium">Admin Promotion</h5>
                  <p className="text-gray-300 text-sm">
                    This will grant full administrative privileges to this member.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h6 className="text-white font-medium">Admin privileges include:</h6>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Access to admin dashboard and management tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Ability to manage other members and their accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    System configuration and settings management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Financial operations and payment management
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong>Member since:</strong> {formatDate(member.created_at)}
                </p>
                {member.active_trades !== undefined && (
                  <p className="text-gray-300 text-sm">
                    <strong>Active trades:</strong> {member.active_trades}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Confirmation */
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Final Confirmation Required</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  You are about to promote <strong>{member.full_name}</strong> to Administrator.
                </p>
                <div className="bg-yellow-500/5 p-3 rounded border border-yellow-500/20">
                  <p className="text-yellow-200 text-sm font-medium">
                    ⚠️ This action will immediately grant full administrative access and cannot be easily undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Member Name:</span>
                  <span className="text-white font-medium">{member.full_name}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{member.email}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Current Role:</span>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">New Role:</span>
                  <Badge variant="default" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 flex gap-3">
          <Button
            variant="outline"
            onClick={confirmed ? () => setConfirmed(false) : handleCancel}
            disabled={isLoading}
            className="bg-transparent border-border/50 text-gray-300 hover:bg-card/20"
          >
            {confirmed ? 'Back' : 'Cancel'}
          </Button>

          <Button
            onClick={handlePromote}
            disabled={isLoading}
            className={
              confirmed
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Promoting...
              </>
            ) : (
              <>
                {confirmed ? (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Confirm Promotion
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}