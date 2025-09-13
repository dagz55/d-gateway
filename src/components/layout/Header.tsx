'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, LogOut, Moon, Settings, Sun, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500';
      case 'IDLE':
        return 'bg-orange-500';
      case 'OFFLINE':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'Online';
      case 'IDLE':
        return 'Idle';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'VIP':
        return 'bg-purple-500 text-white';
      case 'PRO':
        return 'bg-blue-500 text-white';
      case 'PREMIUM':
        return 'bg-green-500 text-white';
      case 'BASIC':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTraderLevelColor = (level: string) => {
    switch (level) {
      case 'PROFESSIONAL':
        return 'bg-purple-500 text-white';
      case 'EXPERT':
        return 'bg-red-500 text-white';
      case 'ADVANCED':
        return 'bg-orange-500 text-white';
      case 'INTERMEDIATE':
        return 'bg-yellow-500 text-black';
      case 'BEGINNER':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <header className={`flex h-16 items-center justify-between px-6 border-b bg-background ${className}`}>
      <div className="flex items-center md:ml-0 ml-16">
        <h2 className="text-lg font-semibold">Zignal</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="flex items-center gap-2"
        >
          {isMounted ? (
            <>
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''} alt={user?.user_metadata?.full_name || user?.email || ''} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(user?.user_metadata?.status || 'OFFLINE')}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''} alt={user?.user_metadata?.full_name || user?.email || ''} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email || 'User'}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(user?.user_metadata?.status || 'OFFLINE')}`} />
                        <p className="text-xs text-muted-foreground">
                          {getStatusText(user?.user_metadata?.status || 'OFFLINE')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {user?.user_metadata?.is_verified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                {/* Name */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Name:</span>
                  <span className="text-xs font-medium">{user?.user_metadata?.full_name || user?.email || 'N/A'}</span>
                </div>
                
                {/* Age */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Age:</span>
                  <span className="text-xs font-medium">{user?.user_metadata?.age || 'N/A'}</span>
                </div>
                
                {/* Gender */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Gender:</span>
                  <span className="text-xs font-medium">{user?.user_metadata?.gender || 'N/A'}</span>
                </div>
                
                {/* Trader Level */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Trader Level:</span>
                  <Badge className={`text-xs ${getTraderLevelColor(user?.user_metadata?.trader_level || 'BEGINNER')}`}>
                    {user?.user_metadata?.trader_level || 'BEGINNER'}
                  </Badge>
                </div>
                
                {/* Account Balance */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Balance:</span>
                  <span className="text-xs font-medium text-green-600">
                    {formatCurrency(user?.user_metadata?.account_balance || 0)}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
