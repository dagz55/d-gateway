'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Clock,
  Activity,
  Wallet,
  TrendingUp
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
  phone?: string;
  wallet_balance?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

interface ViewDetailsModalProps {
  member: MemberData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewDetailsModal({ member, isOpen, onClose }: ViewDetailsModalProps) {
  if (!member) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="admin-dashboard max-w-2xl bg-gray-900 border-gray-700 max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-gray-700">
          <DialogTitle className="flex items-center gap-3 text-white">
            <User className="h-5 w-5" />
            Member Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View detailed information about this member account.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 max-h-[calc(85vh-80px)] overflow-y-scroll overflow-x-hidden modal-scrollbar">
          <div className="space-y-6 pt-4">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
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
              <h3 className="text-xl font-semibold text-white">{member.full_name}</h3>
              <p className="text-gray-400">{member.display_name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={member.is_admin ? "default" : "secondary"} className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {member.is_admin ? 'Admin' : 'Member'}
                </Badge>
                <Badge
                  variant={member.status === 'active' ? "default" : "destructive"}
                  className="text-xs"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {member.status || (member.last_sign_in_at ? 'Active' : 'Inactive')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email Address</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {member.email}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Phone Number</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {member.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Registration Date</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {formatDate(member.created_at)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Last Sign In</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {member.last_sign_in_at ? formatDate(member.last_sign_in_at) : 'Never'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">User ID</label>
              <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30 font-mono text-sm">
                {member.user_id}
              </p>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Trading & Financial Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Trading & Financial Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Active Trades</label>
                <div className="flex items-center gap-2 bg-card/50 p-3 rounded-lg border border-border/30">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-white font-semibold">
                    {member.active_trades || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Wallet Balance</label>
                <div className="flex items-center gap-2 bg-card/50 p-3 rounded-lg border border-border/30">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-semibold">
                    {member.wallet_balance ? formatCurrency(member.wallet_balance) : '$0.00'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Total Deposits</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {member.total_deposits ? formatCurrency(member.total_deposits) : '$0.00'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Total Withdrawals</label>
                <p className="text-white bg-card/50 p-3 rounded-lg border border-border/30">
                  {member.total_withdrawals ? formatCurrency(member.total_withdrawals) : '$0.00'}
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}