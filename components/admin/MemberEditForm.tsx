'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Save,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

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
}

interface MemberEditFormProps {
  member: MemberData;
}

export default function MemberEditForm({ member }: MemberEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: member.full_name.split(' ')[0] || '',
    lastName: member.full_name.split(' ').slice(1).join(' ') || '',
    username: member.display_name || '',
    role: member.role,
    is_admin: member.is_admin,
    suspended: false // This would come from metadata in real implementation
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (formData.firstName.length > 50) {
      return 'First name must be 50 characters or less';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (formData.lastName.length > 50) {
      return 'Last name must be 50 characters or less';
    }
    if (!formData.username.trim()) {
      return 'Username is required';
    }
    if (formData.username.length > 30) {
      return 'Username must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleSave = async () => {
    // Validate form before submission
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      toast.success('Member updated successfully');
      router.push(`/admin/members/${member.user_id}`);
    } catch (error) {
      toast.error('Failed to update member');
      console.error('Error updating member:', error);
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
        body: JSON.stringify({
          action: 'promote'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to promote member');
      }

      toast.success('Member promoted to admin successfully');
      router.push(`/admin/members/${member.user_id}`);
    } catch (error) {
      toast.error('Failed to promote member');
      console.error('Error promoting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoteFromAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'demote'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to demote member');
      }

      toast.success('Member demoted to regular user successfully');
      router.push(`/admin/members/${member.user_id}`);
    } catch (error) {
      toast.error('Failed to demote member');
      console.error('Error demoting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suspend'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend member');
      }

      toast.success('Member suspended successfully');
      router.push(`/admin/members/${member.user_id}`);
    } catch (error) {
      toast.error('Failed to suspend member');
      console.error('Error suspending member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'activate'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate member');
      }

      toast.success('Member activated successfully');
      router.push(`/admin/members/${member.user_id}`);
    } catch (error) {
      toast.error('Failed to activate member');
      console.error('Error activating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${member.user_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      toast.success('Member deleted successfully');
      router.push('/admin/users');
    } catch (error) {
      toast.error('Failed to delete member');
      console.error('Error deleting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Member Avatar and Basic Info */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />
          <AvatarFallback className="bg-accent/10 text-accent text-2xl">
            {(member.full_name || member.email).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{member.full_name || 'No Name'}</h3>
          <p className="text-muted-foreground">{member.email}</p>
          <div className="flex items-center gap-2">
            {member.is_admin ? (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            ) : (
              <Badge variant="outline">Member</Badge>
            )}
            {member.email_verified && (
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username/Display Name</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={member.email}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Actions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Role Management */}
          {!member.is_admin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Promote to Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to promote {member.email} to admin?
                    This will give them full administrative privileges.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePromoteToAdmin} disabled={isLoading}>
                    Promote to Admin
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {member.is_admin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserX className="h-4 w-4 mr-2" />
                  Demote from Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Demote from Admin</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to demote {member.email} from admin?
                    They will lose all administrative privileges.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDemoteFromAdmin} disabled={isLoading}>
                    Demote to Member
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Account Status */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <UserX className="h-4 w-4 mr-2" />
                Suspend Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-border/50">
              <AlertDialogHeader>
                <AlertDialogTitle>Suspend Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to suspend {member.email}?
                  They will not be able to access their account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSuspend} disabled={isLoading}>
                  Suspend Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <UserCheck className="h-4 w-4 mr-2" />
                Activate Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-border/50">
              <AlertDialogHeader>
                <AlertDialogTitle>Activate Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to activate {member.email}?
                  They will regain access to their account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleActivate} disabled={isLoading}>
                  Activate Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      {/* Danger Zone */}
      {!member.is_admin && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Member Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-border/50">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Member Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete {member.email}?
                  This action cannot be undone and will remove all their data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Save Changes */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/20">
        <Button variant="outline" asChild>
          <a href={`/admin/members/${member.user_id}`}>Cancel</a>
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}