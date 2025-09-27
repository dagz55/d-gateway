import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfileSection from '@/components/layout/ProfileSection';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSection isCollapsed={false} />
        </CardContent>
      </Card>
    </div>
  );
}
