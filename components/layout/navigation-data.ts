import {
  LayoutDashboard,
  TrendingUp,
  History,
  Signal,
  Wallet,
  Newspaper,
  Copy,
  Settings,
  Shield,
  Rocket,
} from 'lucide-react';

export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAdmin?: boolean;
};

export const BASE_NAVIGATION: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Market',
    href: '/dashboard/market',
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

export const ADMIN_NAVIGATION: NavItem[] = [
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
  },
];