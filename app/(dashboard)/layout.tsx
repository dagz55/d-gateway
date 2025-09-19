import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <AppLayout>{children}</AppLayout>;
}