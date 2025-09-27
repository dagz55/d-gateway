'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Wallet,
  Save,
  X,
  Shield
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
  email_verified: boolean;
  phone?: string;
  banned: boolean;
  locked: boolean;
  active_trades?: number;
  wallet_balance?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

interface EditMemberModalProps {
  member: MemberData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: Partial<MemberData>) => Promise<void>;
}

export default function EditMemberModal({ member, isOpen, onClose, onSave }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    wallet_balance: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        full_name: member.full_name || '',
        display_name: member.display_name || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'active',
        wallet_balance: member.wallet_balance || 0
      });
      setErrors({});
    }
  }, [member, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.wallet_balance < 0) {
      newErrors.wallet_balance = 'Wallet balance cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !member) return;

    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        user_id: member.user_id
      };

      await onSave(updatedData);
      toast.success('Member updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update member');
      console.error('Error updating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="admin-dashboard max-w-2xl bg-gray-900 border-gray-700 max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-white">
            <User className="h-5 w-5" />
            Edit Member Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update member information, contact details, and account settings.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 max-h-[calc(85vh-140px)] overflow-y-scroll overflow-x-hidden modal-scrollbar">
          <div className="space-y-6 pt-4">
          {/* Profile Preview */}
          <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg border border-border/30">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-border/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {formData.full_name.charAt(0).toUpperCase() || member.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <Badge variant={member.is_admin ? "default" : "secondary"} className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {member.is_admin ? 'Admin' : 'Member'}
              </Badge>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-card/50 border-border/30 text-white"
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="text-red-400 text-sm">{errors.full_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-white">
                  Display Name *
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="bg-card/50 border-border/30 text-white"
                  placeholder="Enter display name"
                />
                {errors.display_name && (
                  <p className="text-red-400 text-sm">{errors.display_name}</p>
                )}
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
                <Label htmlFor="email" className="text-white">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-card/50 border-border/30 text-white"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-card/50 border-border/30 text-white"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Account Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Account Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Account Status
                </Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-card/50 border-border/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet_balance" className="text-white">
                  Wallet Balance ($)
                </Label>
                <Input
                  id="wallet_balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wallet_balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, wallet_balance: parseFloat(e.target.value) || 0 }))}
                  className="bg-card/50 border-border/30 text-white"
                  placeholder="0.00"
                />
                {errors.wallet_balance && (
                  <p className="text-red-400 text-sm">{errors.wallet_balance}</p>
                )}
              </div>
            </div>
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
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}