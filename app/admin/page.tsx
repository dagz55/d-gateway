import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function LegacyAdminPage() {
  // Middleware handles authentication - just redirect to new admin path
  // This prevents conflicts between page-level auth and middleware auth
  redirect('/dashboard/admins');
}