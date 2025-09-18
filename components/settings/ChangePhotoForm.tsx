'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, User, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';
// Removed Server Action imports - now using API routes
import { validateImageFile, ACCEPT_FILE_TYPES, ACCEPT_FILE_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS } from '@/lib/validation';

export default function ChangePhotoForm() {
  const { user, profile } = useWorkOSAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Use profile data first, then fallback to user data
    const avatarUrl = profile?.avatar_url || profile?.profile_picture_url || user?.profilePictureUrl;
    setCurrentAvatarUrl(avatarUrl || null);
  }, [profile?.avatar_url, profile?.profile_picture_url, user?.profilePictureUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using shared validation
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error!);
        // Reset the file input so user can select the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Revoke existing object URL to prevent memory leak
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        // Clear selected file and preview state to avoid stale UI
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      // Revoke previous object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setSelectedFile(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be signed in to change your photo');
      return;
    }
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert to base64 for fallback
      const base64Data = await fileToBase64(selectedFile);
      
      // Create form data for API route
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('base64', base64Data);

      // Use API route instead of Server Action
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setCurrentAvatarUrl(result.avatarUrl);
        toast.success('Profile photo updated successfully!');
        
        // Clear preview first, then revoke object URL
        setPreviewUrl(null);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Failed to update photo');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading photo:', error);
      }
      toast.error('Failed to update photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Use API route instead of Server Action
      const response = await fetch('/api/upload/avatar', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCurrentAvatarUrl(null);
        toast.success('Profile photo removed successfully!');
        
        // Clear preview first, then revoke object URL
        setPreviewUrl(null);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Failed to remove photo');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing photo:', error);
      }
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
            <AvatarImage src={currentAvatarUrl || undefined} alt="Profile photo" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="photo">Choose a photo</Label>
            <Input
              id="photo"
              type="file"
              accept={[ACCEPT_FILE_TYPES, ACCEPT_FILE_EXTENSIONS, '.heic', '.heif'].filter(Boolean).join(',')}
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF, WEBP, HEIC, or HEIF. Max size 5MB.
            </p>
          </div>
        </div>

        {previewUrl && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewUrl || undefined} alt="Preview" />
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
            disabled={isSubmitting || !previewUrl || !user || !selectedFile}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Uploading...' : 'Upload Photo'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRemovePhoto}
            disabled={isSubmitting || !currentAvatarUrl}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Removing...' : 'Remove Photo'}
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
