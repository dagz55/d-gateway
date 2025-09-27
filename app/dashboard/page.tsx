import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/admin';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
    return;
  }

  // Use the same admin check logic as the rest of the app
  const userIsAdmin = await isAdmin();

  // Redirect based on role
  if (userIsAdmin) {
    redirect('/dashboard/admins/dashboard');
  } else {
    redirect('/dashboard/members/dashboard');
  }
}
