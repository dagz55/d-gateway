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
import { User, Settings, LogOut, CreditCard, Wifi, WifiOff, ShieldCheck } from 'lucide-react';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || 'User';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = fullName.split(' ').map(name => name[0]).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 rounded-full p-1 hover:bg-accent transition-colors relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isAdmin && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 px-1 text-[10px] leading-4">
            Admin
          </Badge>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              {isAdmin && (
                <Badge variant="secondary" className="h-5 px-2 text-xs flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Active Subscription</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Pro
          </Badge>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>Online Status</span>
          </div>
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleProfileSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
