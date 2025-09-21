import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function AuthPage() {
  // Check if user is already authenticated
  const user = await currentUser();

  if (user) {
    // User is authenticated, redirect to dashboard
    redirect('/dashboard');
  } else {
    // User not authenticated, redirect to sign-in
    redirect('/sign-in');
  }
}