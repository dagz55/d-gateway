'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateUsername } from '@/lib/actions';

const changeUsernameSchema = z.object({
  currentUsername: z.string().min(1, 'Current username is required'),
  newUsername: z.string().min(3, 'Username must be at least 3 characters'),
});

type ChangeUsernameFormData = z.infer<typeof changeUsernameSchema>;

interface ChangeUsernameFormProps {
  currentUsername: string;
}

export default function ChangeUsernameForm({ currentUsername }: ChangeUsernameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeUsernameFormData>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: {
      currentUsername,
    },
  });

  const onSubmit = async (data: ChangeUsernameFormData) => {
    if (data.currentUsername !== currentUsername) {
      toast.error('Current username does not match');
      return;
    }

    if (data.newUsername === currentUsername) {
      toast.error('New username must be different from current username');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUsername(data.newUsername);
      
      if (result.success) {
        toast.success('Username updated successfully!');
        reset({ currentUsername: data.newUsername, newUsername: '' });
        // Update the currentUsername prop by refreshing the page or using a callback
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update username');
      }
    } catch (error) {
      toast.error('Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Username</CardTitle>
        <CardDescription>
          Update your username. This will be visible to other users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentUsername">Current Username</Label>
            <Input
              id="currentUsername"
              {...register('currentUsername')}
              placeholder="Current username"
              disabled={isSubmitting}
            />
            {errors.currentUsername && (
              <p className="text-sm text-destructive">{errors.currentUsername.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newUsername">New Username</Label>
            <Input
              id="newUsername"
              {...register('newUsername')}
              placeholder="New username"
              disabled={isSubmitting}
            />
            {errors.newUsername && (
              <p className="text-sm text-destructive">{errors.newUsername.message}</p>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Username Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Must be at least 3 characters long</li>
              <li>• Can contain letters, numbers, and underscores</li>
              <li>• Must be unique across all users</li>
              <li>• Cannot be changed more than once per month</li>
            </ul>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Username'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
