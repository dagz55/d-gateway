'use client';

import { ReactNode, Suspense } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen dashboard-bg">
      <Suspense fallback={<div className="fixed left-0 top-0 h-full w-64 glass border-r border-border" />}>
        <Sidebar />
      </Suspense>
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        // Desktop margin adjustments based on sidebar state
        "md:ml-16", // Default collapsed margin (64px)
        !isCollapsed && "md:ml-64", // Expanded margin (256px)
        // Mobile margin to account for visible compact sidebar
        "max-md:ml-16"
      )}>
        <Header />
        <main className="p-4 md:p-6 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}