import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect('/signin');
    return;
  }

  // Check if user is admin
  const publicMetadata = sessionClaims?.publicMetadata as any;
  const isAdmin = publicMetadata?.role === "admin" || publicMetadata?.is_admin === true;

  // Redirect based on role
  if (isAdmin) {
    redirect('/dashboard/admins');
  } else {
    redirect('/dashboard/members');
  }
}
