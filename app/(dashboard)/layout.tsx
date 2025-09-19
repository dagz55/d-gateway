import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Pass userId to avoid duplicate auth calls in child components
  return <AppLayout userId={userId}>{children}</AppLayout>;
}