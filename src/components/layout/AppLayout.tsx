'use client';

import { ReactNode, Suspense } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="fixed left-0 top-0 h-full w-64 bg-background border-r" />}>
        <Sidebar />
      </Suspense>
      <div className="md:ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
