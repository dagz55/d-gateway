import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';

export default async function LegacyAdminPage() {
  // Require admin authentication
  await requireAdmin();

  // Redirect legacy /admin route to new /dashboard/admins
  redirect('/dashboard/admins');
}