import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  // Redirect to the correct admin settings path
  redirect('/admin/dashboard/settings');
}
