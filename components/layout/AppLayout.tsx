'use client';

import { ReactNode, Suspense } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { TradingSidePanel } from './TradingSidePanel';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { TradingPanelProvider, useTradingPanel } from '@/contexts/TradingPanelContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  showTradingPanel?: boolean;
  isAdmin?: boolean;
}

function AppLayoutContent({ children, showTradingPanel = false, isAdmin = false }: { children: ReactNode; showTradingPanel?: boolean, isAdmin?: boolean }) {
  const { isCollapsed } = useSidebar();
  const tradingPanel = useTradingPanel();

  return (
    <div className="min-h-screen dashboard-bg">
      <Suspense fallback={<div className="fixed left-0 top-0 h-full w-64 glass border-r border-border" />}>
        <Sidebar isAdmin={isAdmin} />
      </Suspense>
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        // Desktop margin adjustments based on sidebar state
        "md:ml-16", // Default collapsed margin (64px)
        !isCollapsed && "md:ml-64", // Expanded margin (256px)
        // Mobile margin to account for visible compact sidebar - reduced for better space utilization
        "max-md:ml-12",
        // Right margin for trading panel when open
        showTradingPanel && tradingPanel.isOpen && "md:mr-96 max-md:mr-0"
      )}>
        <Header showTradingToggle={showTradingPanel} />
        <main className="p-1 md:p-6 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Trading Side Panel */}
      {showTradingPanel && (
        <TradingSidePanel
          isOpen={tradingPanel.isOpen}
          onClose={tradingPanel.close}
          onToggle={tradingPanel.toggle}
        />
      )}
    </div>
  );
}

export default function AppLayout({ children, showTradingPanel = false, isAdmin = false }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <TradingPanelProvider>
        <AppLayoutContent showTradingPanel={showTradingPanel} isAdmin={isAdmin}>{children}</AppLayoutContent>
      </TradingPanelProvider>
    </SidebarProvider>
  );
}
