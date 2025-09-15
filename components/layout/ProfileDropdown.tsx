'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, CreditCard, Wifi, WifiOff, ShieldCheck, Crown, Edit3, Bell, HelpCircle, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function ProfileDropdown() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch admin flag from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        setIsAdmin(!!(profile as any)?.is_admin);
      } else {
        setIsAdmin(false);
      }
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Use getUser() for secure user data instead of session.user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          setIsAdmin(!!(profile as any)?.is_admin);
        } else {
          setIsAdmin(false);
        }
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
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileSettings = () => {
    router.push('/settings');
  };

  const handleEditProfile = () => {
    router.push('/profile');
  };

  const handleNotifications = () => {
    // TODO: Implement notifications page
    console.log('Navigate to notifications');
  };

  const handleHelp = () => {
    // TODO: Implement help/support page
    console.log('Navigate to help');
  };

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || 'User';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = fullName.split(' ').map(name => name[0]).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-all duration-200 border border-border/50 hover:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:outline-none group">
        <div className="relative">
          <Avatar className="h-8 w-8 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all duration-200">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-accent to-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 px-1 text-[10px] leading-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              <Crown className="h-2 w-2 mr-0.5" />
              Admin
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
            {fullName}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-accent/70 transition-colors">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none truncate">{fullName}</p>
                  {isAdmin && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Crown className="h-3 w-3" /> Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs leading-none text-muted-foreground truncate mt-1">{email}</p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Membership Status */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-accent to-primary">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Membership Status</p>
                <p className="text-xs text-muted-foreground">Premium Plan Active</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0">
              Pro
            </Badge>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Profile Actions */}
        <div className="space-y-1">
          <DropdownMenuItem onClick={handleEditProfile} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Edit Profile</p>
              <p className="text-xs text-muted-foreground">Update your personal information</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleProfileSettings} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Account Settings</p>
              <p className="text-xs text-muted-foreground">Manage your account preferences</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleNotifications} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Manage your notification preferences</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleHelp} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Help & Support</p>
              <p className="text-xs text-muted-foreground">Get help and contact support</p>
            </div>
          </DropdownMenuItem>
        </div>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin')} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <ShieldCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin Panel</p>
                <p className="text-xs text-muted-foreground">Access administrative functions</p>
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Sign Out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
