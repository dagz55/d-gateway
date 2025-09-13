'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ChangePhotoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile photo updated successfully!');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to update photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSubmitting(true);
    try {
      // Simulate removal process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Profile photo removed successfully!');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to remove photo');
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
