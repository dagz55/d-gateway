import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin authentication without redirect
  const adminUser = await getAdminUser();

  if (!adminUser) {
    // If not an admin, redirect to the member dashboard
    redirect('/member/dashboard');
  }

  return (
    <AdminErrorBoundary>
      <AdminLayoutClient adminUser={adminUser}>
        {children}
      </AdminLayoutClient>
    </AdminErrorBoundary>
  );
}
