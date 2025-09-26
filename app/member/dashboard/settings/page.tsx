import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChangePhotoForm from '@/components/settings/ChangePhotoForm';

export const dynamic = 'force-dynamic';

export default async function MemberSettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePhotoForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(user.emailAddresses) && user.emailAddresses.length > 0 
                    ? user.emailAddresses[0]?.emailAddress 
                    : 'No email available'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Member Since</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
