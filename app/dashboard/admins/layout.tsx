import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Check admin authentication without redirect
    const adminUser = await getAdminUser();
    
    if (!adminUser) {
      redirect('/dashboard/members');
    }
    
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
    // Handle NEXT_REDIRECT errors properly
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors to let Next.js handle them
    }
    console.warn('Admin auth error in layout:', error);
    redirect('/dashboard/members');
  }
}
