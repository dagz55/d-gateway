'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/actions';
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
} from 'lucide-react';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  is_admin: boolean;
}

interface ProfileSectionProps {
  className?: string;
  onNavigate?: () => void; // Callback for mobile navigation close
}

export default function ProfileSection({ className, onNavigate }: ProfileSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user and profile data
    const getUserAndProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        setUser(user);

        if (user) {
          // Fetch full profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.warn('Profile not found, using auth data only:', profileError);
            // Create a basic profile from auth data
            setProfile({
              id: user.id,
              username: user.user_metadata?.full_name || 'User',
              full_name: user.user_metadata?.full_name || 'User',
              avatar_url: user.user_metadata?.avatar_url || null,
              email: user.email || '',
              is_admin: false,
            });
          } else {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await getUserAndProfile();
      }
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      onNavigate?.();
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    } finally {
      setIsSigningOut(false);
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
      onClick: () => handleNavigation('/settings'),
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
  if (isLoading) {
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
  if (error && !user) {
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
  if (!user) {
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

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'User';
  const displayEmail = profile?.email || user.email || '';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const isAdmin = profile?.is_admin || false;
  const initials = displayName.split(' ').map(name => name[0]).join('').toUpperCase();

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
                console.warn('Avatar image failed to load:', avatarUrl);
              }}
            />
            <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-accent to-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {isAdmin && (
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
            className="text-xs text-muted-foreground truncate"
            title={displayEmail}
          >
            {displayEmail}
          </p>
          <div className="flex items-center space-x-1 mt-1">
            <div 
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}
              aria-label={isOnline ? 'Online' : 'Offline'}
            />
            <span className="text-xs text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
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
              className="w-full justify-start text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-200"
              aria-label={action.description}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
        
        {/* Admin Panel Button */}
        {isAdmin && (
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
          disabled={isSigningOut}
          className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50"
          aria-label="Sign out of your account"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}