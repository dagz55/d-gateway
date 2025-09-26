'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Settings,
  LogOut,
  Crown,
  Edit3,
  Bell,
  HelpCircle,
  Shield,
  CreditCard,
  UserCircle,
  ChevronRight,
} from 'lucide-react';

interface ProfileSectionProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export default function ProfileSection({ isCollapsed = false, onNavigate }: ProfileSectionProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isPremium: boolean;
    planName: string;
    status: string;
  }>({
    isPremium: false,
    planName: 'Free Plan',
    status: 'Active'
  });

  // Fetch subscription status from user metadata
  useEffect(() => {
    if (user) {
      const isPremium = user.publicMetadata?.isPremium === true || user.publicMetadata?.subscriptionType === 'premium';
      const planName = isPremium ? 'Premium Plan' : 'Free Plan';
      const status = user.publicMetadata?.subscriptionStatus === 'active' ? 'Active' : 'Inactive';
      
      setSubscriptionStatus({
        isPremium,
        planName,
        status
      });
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className={cn(
        "p-4 border-t border-border",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const email = (Array.isArray(user.emailAddresses) && user.emailAddresses.length > 0) 
    ? user.emailAddresses[0]?.emailAddress || ''
    : '';
  const initials = fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  const isAdmin = user.publicMetadata?.role === 'admin';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-1 md:p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full p-1 md:p-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Avatar className="h-6 w-6 md:h-8 md:w-8">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>

        {isExpanded && (
          <div className="mt-1 md:mt-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-1 md:p-2 text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-card/50">
      {/* Profile Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 px-1 text-[9px] leading-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
            >
              <Crown className="h-2 w-2" />
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold leading-none truncate text-white dark:text-white">{fullName}</p>
            {isAdmin && (
              <Badge variant="secondary" className="h-4 px-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-xs leading-none text-white/80 dark:text-white/80 truncate mt-1 font-medium">{email}</p>
        </div>
      </div>

      {/* Membership Status */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 border border-blue-200/50 dark:border-blue-600/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${subscriptionStatus.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}>
              <Crown className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{subscriptionStatus.planName}</p>
              <p className="text-xs text-slate-800 dark:text-white/90 font-semibold">{subscriptionStatus.status}</p>
            </div>
          </div>
          <Badge className={`${subscriptionStatus.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white border-0 text-xs font-semibold`}>
            {subscriptionStatus.isPremium ? 'Pro' : 'Free'}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1 mb-4">
        
      </div>

      {/* Sign Out */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start h-9 px-2 text-red-400 dark:text-red-400 font-semibold transition-all duration-200 border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-[1.02] hover:shadow-sm hover:border-red-400/30"
        onClick={handleSignOut}
      >
        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 mr-3 transition-all duration-200">
          <LogOut className="h-3 w-3 text-red-600 dark:text-red-400" />
        </div>
        <span className="text-xs font-semibold">Sign Out</span>
      </Button>
    </div>
  );
}
