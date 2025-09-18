'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';
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
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface ProfileSectionProps {
  className?: string;
  onNavigate?: () => void;
}

export default function ProfileSection({ className, onNavigate }: ProfileSectionProps) {
  const {
    user,
    profile,
    loading,
    profileLoading,
    error,
    signOut,
    isAuthenticated,
    isAdmin,
    refreshProfile
  } = useWorkOSAuth();
  
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      onNavigate?.();
      signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onNavigate?.();
  };

  const quickActions = [
    {
      label: 'Edit Profile',
      icon: Edit3,
      onClick: () => handleNavigation('/profile'),
      description: 'Update your personal information',
      color: 'blue',
    },
    {
      label: 'Account Settings',
      icon: Settings,
      onClick: () => handleNavigation('/settings'),
      description: 'Manage your account preferences',
      color: 'gray',
    },
    {
      label: 'Notifications',
      icon: Bell,
      onClick: () => handleNavigation('/settings?tab=notifications'),
      description: 'Configure notification preferences',
      color: 'green',
    },
    {
      label: 'Security',
      icon: Shield,
      onClick: () => handleNavigation('/settings?tab=security'),
      description: 'Manage security settings',
      color: 'purple',
    },
    {
      label: 'Billing',
      icon: CreditCard,
      onClick: () => handleNavigation('/settings?tab=billing'),
      description: 'View subscription and billing',
      color: 'orange',
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => handleNavigation('/help'),
      description: 'Get help and contact support',
      color: 'indigo',
    },
  ];

  // Loading skeleton
  if (loading || profileLoading) {
    return (
      <div className={cn("border-t border-border p-4 animate-pulse", className)}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isAuthenticated) {
    return (
      <div className={cn("border-t border-border p-4", className)}>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Error Loading Profile</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No user state
  if (!isAuthenticated || !user) {
    return (
      <div className={cn("border-t border-border p-4", className)}>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Not Signed In</p>
            <p className="text-xs text-muted-foreground">Please sign in to continue</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || profile?.profile_picture_url || user?.profilePictureUrl;
  const userIsAdmin = profile?.is_admin || isAdmin || false;
  
  // Safe initials calculation
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(segment => segment.length > 0)
    .map(segment => segment[0])
    .join('')
    .toUpperCase() || 
    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || 
    'U';
  const profileStatus = profile?.status || 'ONLINE';
  const isUserOnline = isOnline && profileStatus === 'ONLINE';

  return (
    <div
      className={cn("border-t border-border p-4", className)}
      role="region"
      aria-label="User profile section"
    >
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Avatar
            className="h-10 w-10 ring-2 ring-accent/20 transition-all duration-200"
            aria-label={`${displayName}'s profile picture`}
          >
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const failedUrl = target.src;
                
                // Prevent infinite loop by checking if already using fallback
                if (!failedUrl.includes('/default-avatar.svg')) {
                  target.src = '/default-avatar.svg'; // Set to a default avatar URL
                }
                
                console.warn('Avatar image failed to load:', failedUrl);
              }}
            />
            <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-accent to-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {userIsAdmin && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 px-1 text-[10px] leading-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
              aria-label="Administrator user"
            >
              <Crown className="h-2 w-2 mr-0.5" />
              Admin
            </Badge>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium text-foreground truncate"
            title={displayName}
          >
            {displayName}
          </p>
          <p
            className="text-xs text-muted-enhanced truncate"
            title={displayEmail}
          >
            {displayEmail}
          </p>
          <div className="flex items-center space-x-1 mt-1">
            {isUserOnline ? (
              <Wifi className="w-2 h-2 text-green-400" />
            ) : (
              <WifiOff className="w-2 h-2 text-[#EAF2FF]/60" />
            )}
            <div
              className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-green-400' : 'bg-[#EAF2FF]/60'}`}
              aria-label={isUserOnline ? 'Online' : 'Offline'}
            />
            <span className="text-xs text-muted-enhanced">
              {isUserOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1" role="group" aria-label="Profile quick actions">
        {quickActions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="w-full justify-start text-sm text-tertiary hover:text-primary hover:bg-muted transition-all duration-200"
              aria-label={action.description}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
        
        {/* Admin Panel Button */}
        {userIsAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation('/admin')}
            className="w-full justify-start text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
            aria-label="Access administrator functions"
          >
            <Crown className="mr-2 h-4 w-4" />
            Admin Panel
          </Button>
        )}

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={loading}
          className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50"
          aria-label="Sign out of your account"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-600/20 border border-red-600/30 rounded-md">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}