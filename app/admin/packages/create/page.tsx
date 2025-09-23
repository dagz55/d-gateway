import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminCreatePackagePage() {
  // Redirect to the correct admin create package path
  redirect('/dashboard/admins/packages/create');
}
