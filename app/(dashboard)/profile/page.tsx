import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Settings } from 'lucide-react';
import ChangeUsernameForm from '@/components/settings/ChangeUsernameForm';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/');
  }
  
  return user;
}

export default async function ProfilePage() {
  const user = await getUser();
  const fullName = user.user_metadata?.full_name || 'User';
  const email = user.email || '';

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

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
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Full Name</h4>
              <p className="text-sm">{fullName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email Address</h4>
              <p className="text-sm">{email}</p>
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
              <ChangeUsernameForm currentUsername={fullName} />
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
