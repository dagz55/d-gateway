'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, User, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar, uploadAvatarBase64, removeAvatar } from '@/lib/actions';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function ChangePhotoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setCurrentAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentAvatarUrl(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Use getUser() for secure user data instead of session.user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setCurrentAvatarUrl(user?.user_metadata?.avatar_url || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type to supported formats
      const allowedTypes = new Set([
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ]);
      if (!allowedTypes.has(file.type)) {
        toast.error('Unsupported image type. Please use JPG, PNG, GIF, or WEBP.');
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert to base64 for fallback
      const base64Data = await fileToBase64(selectedFile);
      
      // Try storage first
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('base64', base64Data);

      let result = await uploadAvatar(formData);

      // If storage fails, try base64 only
      if (!result.success && result.error?.includes('Storage')) {
        console.log('Storage failed, trying base64 only...');
        result = await uploadAvatarBase64(base64Data);
      }

      if (result.success) {
        setCurrentAvatarUrl(result.avatarUrl!);
        toast.success('Profile photo updated successfully!');
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Failed to update photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to update photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await removeAvatar();

      if (result.success) {
        setCurrentAvatarUrl(null);
        toast.success('Profile photo removed successfully!');
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Failed to remove photo');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
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
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF or WEBP. Max size 5MB.
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
            disabled={isSubmitting || !previewUrl}
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
