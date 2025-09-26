import { requireAdminPermission, ADMIN_PERMISSIONS } from '@/lib/admin';
import AdminUsersClient from '@/components/admin/AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  // Require admin permission for users management
  await requireAdminPermission(ADMIN_PERMISSIONS.USERS);

  return <AdminUsersClient />;
}

