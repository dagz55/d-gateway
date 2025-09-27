'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updatePassword } from '@/lib/actions';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.currentPassword === data.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(data.currentPassword, data.newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        reset();
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-lg md:text-xl">Change Password</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm md:text-base">Current Password</Label>
            <PasswordInput
              id="currentPassword"
              {...register('currentPassword')}
              placeholder="Enter current password"
              disabled={isSubmitting}
              className="text-sm md:text-base"
            />
            {errors.currentPassword && (
              <p className="text-xs md:text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm md:text-base">New Password</Label>
            <PasswordInput
              id="newPassword"
              {...register('newPassword')}
              placeholder="Enter new password"
              disabled={isSubmitting}
              showStrengthIndicator
              className="text-sm md:text-base"
            />
            {errors.newPassword && (
              <p className="text-xs md:text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="Confirm new password"
              disabled={isSubmitting}
              className="text-sm md:text-base"
            />
            {errors.confirmPassword && (
              <p className="text-xs md:text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="p-3 md:p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 text-sm md:text-base">Password Requirements</h4>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Mix of letters, numbers, and symbols</li>
              <li>• Different from your current password</li>
              <li>• Not easily guessable</li>
            </ul>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto text-sm md:text-base">
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
