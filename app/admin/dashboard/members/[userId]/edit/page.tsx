import { requireAdmin } from '@/lib/admin';
import MemberEditForm from '@/components/admin/MemberEditForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MemberData {
  user_id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
  email_verified: boolean;
  phone?: string;
  banned: boolean;
  locked: boolean;
}

async function getMemberForEdit(userId: string): Promise<MemberData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/members/${userId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching member for edit:', error);
    return null;
  }
}

export default async function MemberEditPage({
  params
}: {
  params: { userId: string }
}) {
  // Require admin authentication
  await requireAdmin();

  const member = await getMemberForEdit(params.userId);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/members/${member.user_id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Member Details
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Edit Member
          </h1>
          <p className="text-xl text-muted-foreground">
            Update member information and permissions
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>
            Update the member's personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberEditForm member={member} />
        </CardContent>
      </Card>
    </div>
  );
}