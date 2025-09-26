import { redirect } from 'next/navigation';

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export default async function LegacyMemberPage() {
  // Middleware handles authentication - just redirect to new member path
  redirect('/member/dashboard');
}