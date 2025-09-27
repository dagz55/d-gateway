'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LogOut,
  Crown,
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
        "border-t border-border/60 bg-gradient-to-b from-slate-50/95 to-slate-100/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-sm",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full shadow-md"></div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-1"></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
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

  const menuItems: never[] = [];

  if (isCollapsed) {
    return (
      <div className="p-2 border-t border-border/60 bg-gradient-to-b from-slate-50/95 to-slate-100/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          className="w-full p-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-1 ring-blue-500/20 shadow-md">
              <AvatarImage src={user.imageUrl} alt={fullName} />
              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[8px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white border border-white dark:border-slate-800 rounded-full shadow-md flex items-center justify-center"
              >
                <Crown className="h-2.5 w-2.5" />
              </Badge>
            )}
          </div>
        </Button>

        {isExpanded && (
          <div className="mt-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-slate-50/50 dark:bg-slate-700/50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border/60 bg-gradient-to-b from-slate-50/95 to-slate-100/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-sm">
      {/* Profile Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-blue-500/30 shadow-lg">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-7 w-7 p-0 text-[9px] leading-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-white dark:border-slate-800 rounded-full shadow-lg flex items-center justify-center"
            >
              <Crown className="h-3.5 w-3.5" />
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold leading-none truncate text-slate-900 dark:text-slate-100">{fullName}</p>
          </div>
          <p className="text-xs leading-none text-slate-600 dark:text-slate-400 truncate mt-1 font-medium">{email}</p>
        </div>
      </div>

      {/* Membership Status */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/80 dark:to-slate-800/80 border border-slate-200/80 dark:border-slate-600/60 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${subscriptionStatus.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-slate-400 to-slate-600'} shadow-sm`}>
              <Crown className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{subscriptionStatus.planName}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{subscriptionStatus.status}</p>
            </div>
          </div>
          <Badge className={`${subscriptionStatus.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-slate-500 to-slate-600'} text-white border-0 text-xs font-semibold shadow-sm`}>
            {subscriptionStatus.isPremium ? 'Pro' : 'Free'}
          </Badge>
        </div>
      </div>


      {/* Sign Out */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start h-9 px-2 text-red-600 dark:text-red-400 font-semibold transition-all duration-200 border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-[1.02] hover:shadow-sm hover:border-red-400/30 bg-slate-50/50 dark:bg-slate-700/50"
        onClick={handleSignOut}
      >
        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/40 mr-3 transition-all duration-200">
          <LogOut className="h-3 w-3 text-red-600 dark:text-red-400" />
        </div>
        <span className="text-xs font-semibold">Sign Out</span>
      </Button>
    </div>
  );
}