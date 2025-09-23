import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminMemberActivityPage() {
  // Redirect to the correct admin member activity path
  redirect('/dashboard/admins/member-activity');
}
