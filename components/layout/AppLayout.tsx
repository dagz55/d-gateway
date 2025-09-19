'use client';

import { ReactNode, Suspense } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  userId?: string;
}

export default function AppLayout({ children, userId }: AppLayoutProps) {
  return (
    <div className="min-h-screen dashboard-bg">
      <Suspense fallback={<div className="fixed left-0 top-0 h-full w-64 glass border-r border-border" />}>
        <Sidebar />
      </Suspense>
      <div className="md:ml-64">
        <Header />
        <main className="p-6 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}