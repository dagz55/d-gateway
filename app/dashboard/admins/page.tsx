import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';

export default async function AdminPage() {
  // Require admin authentication
  await requireAdmin();

  // Redirect to admin dashboard
  redirect('/dashboard/admins/dashboard');
}
