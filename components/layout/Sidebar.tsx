'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  History,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  Signal,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Trading History',
    href: '/dashboard?tab=trades',
    icon: History,
  },
  {
    name: 'Trading Signals',
    href: '/dashboard?tab=signals',
    icon: Signal,
  },
  {
    name: 'Deposit',
    href: '/dashboard?tab=deposits',
    icon: ArrowUpRight,
  },
  {
    name: 'Deposit History',
    href: '/dashboard?tab=deposit-history',
    icon: History,
  },
  {
    name: 'Withdraw',
    href: '/dashboard?tab=withdrawals',
    icon: ArrowDownLeft,
  },
  {
    name: 'Withdrawal History',
    href: '/dashboard?tab=withdrawal-history',
    icon: History,
  },
  {
    name: 'Crypto News',
    href: '/dashboard?tab=news',
    icon: Newspaper,
  },
  {
    name: 'Copy Trading Signal',
    href: '/dashboard?tab=copy-trading',
    icon: Copy,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    // Handle dashboard tab navigation
    if (href.includes('?tab=')) {
      const url = new URL(href, 'http://localhost:3000');
      const tab = url.searchParams.get('tab');
      const currentTab = searchParams.get('tab');
      
      // If we're on dashboard and the tab matches
      if (pathname === '/dashboard' && tab === currentTab) {
        return true;
      }
    }
    
    // Handle exact matches for non-dashboard routes
    if (href === '/settings') {
      return pathname === '/settings';
    }
    
    // Handle dashboard base route (no tab)
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !searchParams.get('tab');
    }
    
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <h1 className="text-xl font-bold">Trading Platform</h1>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-sm border-l-4 border-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                    )}
                  >
                    <Icon className={cn(
                      "mr-3 h-4 w-4 transition-transform duration-200",
                      isActive(item.href) && "scale-110"
                    )} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
