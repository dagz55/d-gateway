import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import AppLayout from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin - if so, redirect to admin dashboard
  const userIsAdmin = await isAdmin();
  if (userIsAdmin) {
    redirect('/admin');
  }

  return <AppLayout showTradingPanel={true}>{children}</AppLayout>;
}
