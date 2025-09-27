'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateProfile, getUserProfile } from '@/lib/actions';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: {
    full_name?: string;
    bio?: string;
    phone?: string;
    country?: string;
    timezone?: string;
    language?: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (!initialData && !isLoading) {
      loadProfile();
    }
  }, [initialData, isLoading]);

  const loadProfile = async () => {
    try {
      const result = await getUserProfile();
      if (result.success && result.profile) {
        const profileData = {
          full_name: result.profile.full_name || '',
          bio: result.profile.bio || '',
          phone: result.profile.phone || '',
          country: result.profile.country || '',
          timezone: result.profile.timezone || '',
          language: result.profile.language || '',
        };
        reset(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Loading your profile...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-lg md:text-xl">Profile Information</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Update your personal information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm md:text-base">Full Name</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className="text-sm md:text-base"
              />
              {errors.full_name && (
                <p className="text-xs md:text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm md:text-base">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
                className="text-sm md:text-base"
              />
              {errors.phone && (
                <p className="text-xs md:text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm md:text-base">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself..."
              className="min-h-[80px] md:min-h-[100px] text-sm md:text-base"
              disabled={isSubmitting}
            />
            {errors.bio && (
              <p className="text-xs md:text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm md:text-base">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Enter your country"
                disabled={isSubmitting}
                className="text-sm md:text-base"
              />
              {errors.country && (
                <p className="text-xs md:text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm md:text-base">Timezone</Label>
              <Select onValueChange={(value) => setValue('timezone', value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-xs md:text-sm text-destructive">{errors.timezone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm md:text-base">Language</Label>
            <Select onValueChange={(value) => setValue('language', value)}>
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-xs md:text-sm text-destructive">{errors.language.message}</p>
            )}
          </div>

          <div className="p-3 md:p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 text-sm md:text-base">Profile Guidelines</h4>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
              <li>• Keep your information up to date</li>
              <li>• Use a professional profile picture</li>
              <li>• Your bio helps other users understand your background</li>
              <li>• Timezone settings help with scheduling and notifications</li>
            </ul>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto text-sm md:text-base">
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
