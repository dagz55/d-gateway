import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function LegacyMemberPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Redirect legacy /member route to new /dashboard/members
  redirect('/dashboard/members');
}