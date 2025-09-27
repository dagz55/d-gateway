import { redirect } from 'next/navigation';

export default function DashboardWalletRedirect() {
  // Redirect to the main wallet page
  redirect('/wallet');
}