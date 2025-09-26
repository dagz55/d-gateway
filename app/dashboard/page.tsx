import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/user-profile';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function DashboardRootPage() {
  const { userId, orgId, publicMetadata } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const isAdmin = publicMetadata?.role === "admin" || publicMetadata?.is_admin === true;

  if (isAdmin) {
    redirect('/admin/dashboard');
  }

  // If not admin, redirect to member dashboard
  redirect('/member/dashboard');
}
