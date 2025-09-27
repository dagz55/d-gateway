'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

const DashboardLink = () => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const href = isAdmin ? '/admin/dashboard' : '/member/dashboard';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/15 hover:shadow-lg hover:shadow-white/10"
    >
      <LayoutDashboard className="h-4 w-4" />
      Dashboard
    </Link>
  );
};

export default DashboardLink;
