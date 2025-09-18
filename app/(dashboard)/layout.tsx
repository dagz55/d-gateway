import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-middleware';
import AppLayout from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/');
    }

    return <AppLayout>{children}</AppLayout>;
  } catch (error) {
    console.warn('WorkOS auth error in dashboard layout:', error);
    redirect('/');
  }
}