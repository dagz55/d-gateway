import { redirect } from 'next/navigation';

export default function MembersPage() {
  // Redirect /dashboard/members to /dashboard/members/dashboard
  redirect('/dashboard/members/dashboard');
}