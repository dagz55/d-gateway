'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
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
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProfileSection from './ProfileSection';
import { useUser } from '@clerk/nextjs';
import { checkAdminStatus } from '@/lib/admin-utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Market',
    href: '/market',
    icon: TrendingUp,
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
    name: 'Wallet',
    href: '/wallet',
    icon: Wallet,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const { isAdmin } = checkAdminStatus(user);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Add admin navigation if user is admin
  const adminNavigation = isAdmin ? [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      isAdmin: true,
    },
  ] : [];

  const allNavigation = [...navigation, ...adminNavigation];

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
    if (href === '/settings' || href === '/admin' || href === '/market' || href === '/wallet') {
      return pathname === href;
    }
    
    // Handle dashboard base route (no tab)
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !searchParams.get('tab');
    }
    
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button - Only show when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent/20"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden max-md:top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 z-40 glass border-r border-border transform transition-all duration-300 ease-in-out md:translate-x-0',
          'top-0 h-full md:top-0 md:h-full', // Desktop: full height from top
          'max-md:top-16 max-md:h-[calc(100vh-4rem)]', // Mobile: start below header (64px/4rem)
          isCollapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-border transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-between px-6"
          )}>
            <div className="flex items-center">
              <Logo
                size={isCollapsed ? 'sm' : 'md'}
                showText={!isCollapsed}
                textClassName="gradient-text font-bold"
              />
            </div>
            
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-1">
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 hover:bg-accent/20"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-1">
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 hover:bg-accent/20"
                  onClick={() => setIsCollapsed(true)}
                  title="Minimize sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 hover:bg-accent/20"
                onClick={() => setIsOpen(false)}
                title="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <div className="px-2 py-2 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full p-2 h-8 hover:bg-accent/20"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                const isActiveLink = isActive(item.href);
                const isAdminItem = item.isAdmin;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center text-sm font-medium rounded-xl transition-all duration-300 relative group',
                      isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3',
                      isActiveLink
                        ? 'bg-accent/20 text-accent shadow-lg border border-accent/30 card-glow'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground hover:shadow-md hover:border hover:border-border',
                      // Special admin panel hover styling
                      isAdminItem && !isActiveLink && 'hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500/30 dark:hover:text-yellow-400'
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isActiveLink && "scale-110",
                      !isCollapsed && "mr-3"
                    )} />
                    {!isCollapsed && (
                      <span className={cn(
                        isAdminItem && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Enhanced Profile Section */}
          <ProfileSection 
            isCollapsed={isCollapsed} 
            onNavigate={() => setIsOpen(false)} 
          />
        </div>
      </div>
    </>
  );
}
