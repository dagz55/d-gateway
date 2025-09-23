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
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProfileSection from './ProfileSection';
import { useUser } from '@clerk/nextjs';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useSidebar } from '@/contexts/SidebarContext';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAdmin?: boolean;
};

const BASE_NAVIGATION: NavItem[] = [
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
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { navigateWithLoading } = useNavigationLoading();
  
  // Check if user is admin using client-side user object
  const isAdmin = user?.publicMetadata?.isAdmin === true || user?.publicMetadata?.role === 'admin';



  // Add admin navigation if user is admin
  const ADMIN_NAVIGATION: NavItem[] = [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      isAdmin: true,
    },
    {
      name: 'Deployment',
      href: '/deployment',
      icon: Rocket,
      isAdmin: true,
    }
  ];

  const allNavigation = useMemo(
    () => [...BASE_NAVIGATION, ...(isAdmin ? ADMIN_NAVIGATION : [])],
    [isAdmin]
  );

  const isActive = useCallback(
    (href: string) => {
      if (!href) return false;

      if (href.includes("?tab=")) {
        const url = new URL(href, "http://localhost:3000");
        const tab = url.searchParams.get("tab");
        return pathname === "/dashboard" && tab === searchParams.get("tab");
      }

      if (href === "/dashboard") {
        return pathname === "/dashboard" && !searchParams.get("tab");
      }

      const exactPaths = ["/settings", "/admin", "/market", "/wallet", "/deployment"];
      if (exactPaths.includes(href)) {
        return pathname === href;
      }

      return pathname.startsWith(href);
    },
    [pathname, searchParams]
  );

  const getNavItemClasses = useCallback(
    (isActiveLink: boolean, isCollapsed: boolean, isAdminItem?: boolean) =>
      cn(
        "flex items-center text-sm font-medium rounded-xl transition-all duration-300 relative group",
        isCollapsed ? "md:px-2 md:py-3 md:justify-center" : "md:px-3 md:py-3",
        "max-md:px-2 max-md:py-3 max-md:justify-center",
        isActiveLink
          ? "bg-accent/20 text-accent shadow-lg border border-accent/30 card-glow"
          : "text-foreground/70 hover:bg-muted hover:text-foreground hover:shadow-md hover:border hover:border-border",
        isAdminItem &&
          !isActiveLink &&
          "hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500/30 dark:hover:text-yellow-400"
      ),
    []
  );

  return (
    <>


      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 z-40 glass border-r border-border transform transition-all duration-300 ease-in-out",
          "top-0 h-full",
          "md:w-64 md:translate-x-0", // Desktop expanded
          isCollapsed && "md:w-16", // Desktop collapsed
          "max-md:w-16 max-md:translate-x-0", // Mobile always compact
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-border transition-all duration-300",
            // Desktop layout
            "md:px-6",
            isCollapsed ? "md:justify-center md:px-2" : "md:justify-between",
            // Mobile layout - always centered and compact
            "max-md:justify-center max-md:px-2"
          )}>
            <div className="flex items-center">
              <Logo
                size={isCollapsed ? 'sm' : 'md'}
                showText={false} // Never show text, logo only
                asLink={false} // Disable link in sidebar since we're already in dashboard
                enableAnimations={true} // Enable animations for visual appeal
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

          </div>

          {/* Expand button when collapsed - Desktop only */}
          {isCollapsed && (
            <div className="hidden md:block px-2 py-2 border-b border-border">
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
          <ScrollArea className="flex-1 px-2 py-4 max-md:px-1">
            <nav className="space-y-2">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                const isActiveLink = isActive(item.href);
                const isAdminItem = item.isAdmin;

                return (
                  <button
                    key={item.name}
                    onClick={async () => {
                      await navigateWithLoading(item.href, `Loading ${item.name}...`);
                    }}
                    className={getNavItemClasses(isActiveLink, isCollapsed, isAdminItem)}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActiveLink ? "scale-110" : "",
                      !isCollapsed ? "md:mr-3" : ""
                    )} />
                    {/* Desktop text - only show when not collapsed */}
                    {!isCollapsed && (
                      <span className={cn(
                        "hidden md:block", // Hide text on mobile
                        isAdminItem && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed state or mobile */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Enhanced Profile Section */}
          <ProfileSection 
            isCollapsed={isCollapsed} 
            onNavigate={() => {}} 
          />
        </div>
      </div>
    </>
  );
}
