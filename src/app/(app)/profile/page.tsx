import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">User profile information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Profile page available without authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Profile functionality is now available without user authentication.</p>
        </CardContent>
      </Card>
    </div>
  );
}
