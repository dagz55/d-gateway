import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function LegacyAdminPage() {
  // Require admin authentication
  await requireAdmin();

  // Redirect legacy /admin route to new /dashboard/admins
  redirect('/dashboard/admins');
}