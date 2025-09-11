'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/api/useProfile';
import { Upload, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ChangePhotoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would upload the file to a storage service
      // For development purposes, we'll create a mock URL
      const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?w=150&h=150&fit=crop&crop=face`;
      
      await updateProfile.mutateAsync({
        avatarUrl: mockUrl,
      });
      
      toast.success('Profile photo updated successfully!');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Show a more user-friendly message for 501 errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to update photo';
      if (errorMessage.includes('501') || errorMessage.includes('not implemented')) {
        toast.error('Profile photo update feature is currently under development. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        avatarUrl: undefined,
      });
      
      toast.success('Profile photo removed successfully!');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Show a more user-friendly message for 501 errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove photo';
      if (errorMessage.includes('501') || errorMessage.includes('not implemented')) {
        toast.error('Profile photo update feature is currently under development. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>
          Update your profile picture. This will be visible to other users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={previewUrl || undefined} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="photo">Choose a photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>

        {previewUrl && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewUrl} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                This is how your new profile photo will appear.
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !previewUrl}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Uploading...' : 'Upload Photo'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRemovePhoto}
            disabled={isSubmitting}
          >
            Remove Photo
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use a clear, recent photo of yourself</li>
            <li>• Face should be clearly visible</li>
            <li>• Avoid group photos or photos with other people</li>
            <li>• Professional or casual photos are both acceptable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
