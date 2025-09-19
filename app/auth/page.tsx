import { redirect } from 'next/navigation';

export default function AuthPage() {
  // Since we're using Clerk, redirect to sign-in page
  redirect('/sign-in');
}