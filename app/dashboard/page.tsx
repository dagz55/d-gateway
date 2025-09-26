import { notFound } from 'next/navigation';

// This route has been removed. Use /auth/post-login, /member/dashboard, or /admin/dashboard.
export const dynamic = 'force-dynamic';

export default function RemovedDashboard() {
  notFound();
}
