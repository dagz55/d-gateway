import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  // Redirect to the correct admin users path
  redirect('/dashboard/admins/users');
}
