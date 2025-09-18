import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Settings } from 'lucide-react';
import ChangeUsernameForm from '@/components/settings/ChangeUsernameForm';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import ProfileForm from '@/components/settings/ProfileForm';
import ChangePhotoForm from '@/components/settings/ChangePhotoForm';
import { getCurrentUser } from '@/lib/auth-middleware';
import { getUserProfile } from '@/lib/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getUser() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/');
  }
  
  return user;
}

export default async function ProfilePage() {
  const user = await getUser();
  const fullName = `${user.firstName} ${user.lastName}` || 'User';
  const email = user.email || '';

  // Get user profile from database
  const profileResult = await getUserProfile();
  const profile = profileResult.success ? profileResult.profile : null;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Photo */}
      <Suspense fallback={<div>Loading...</div>}>
        <ChangePhotoForm />
      </Suspense>

      {/* Profile Information */}
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileForm 
          initialData={{
            full_name: profile?.full_name || fullName,
            bio: profile?.bio || '',
            phone: profile?.phone || '',
            country: profile?.country || '',
            timezone: profile?.timezone || 'UTC',
            language: profile?.language || 'en',
          }}
        />
      </Suspense>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Username</h4>
              <p className="text-sm">{profile?.username || 'Not set'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email Address</h4>
              <p className="text-sm">{email}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Account Type</h4>
              <p className="text-sm">{profile?.package || 'Basic'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Trader Level</h4>
              <p className="text-sm">{profile?.trader_level || 'Beginner'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Account Settings</h2>
          </div>
          
          <div className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ChangeUsernameForm currentUsername={profile?.username || fullName} />
            </Suspense>
            
            <Suspense fallback={<div>Loading...</div>}>
              <ChangePasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
