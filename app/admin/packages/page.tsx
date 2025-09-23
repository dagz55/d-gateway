import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminPackagesPage() {
  // Redirect to the correct admin packages path
  redirect('/dashboard/admins/packages');
}
