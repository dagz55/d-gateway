import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Require admin authentication
    const adminUser = await requireAdmin();
    
    return (
      <AdminErrorBoundary 
        showErrorDetails={process.env.NODE_ENV === 'development'}
      >
        <AdminLayoutClient adminUser={adminUser}>
          {children}
        </AdminLayoutClient>
      </AdminErrorBoundary>
    );
  } catch (error) {
    console.warn('Admin auth error in layout:', error);
    redirect('/');
  }
}
