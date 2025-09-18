'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';
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

export default function ProfileDropdown() {
  const {
    user,
    profile,
    loading,
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
      signOut();
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

  if (!isAuthenticated || !user) return null;

  const fullName = profile?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const email = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || profile?.profile_picture_url || user?.profilePictureUrl;
  const initials = fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  const profileStatus = profile?.status || 'ONLINE';
  const isUserOnline = isOnline && profileStatus === 'ONLINE';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 sm:space-x-3 rounded-lg px-2 sm:px-3 py-2 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 ease-in-out border border-border/30 hover:border-accent/30 focus:ring-2 focus:ring-accent/20 focus:outline-none group bg-gradient-to-r from-background to-card/50 backdrop-blur-sm">
        <div className="relative">
          <Avatar className="h-8 w-8 ring-2 ring-accent/20 group-hover:ring-accent/60 group-hover:scale-105 transition-all duration-300 shadow-sm">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-accent to-primary text-white shadow-inner">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online/Offline Indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background transition-all duration-300 ${
            isUserOnline ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-400'
          } ${isUserOnline ? 'shadow-md' : ''}`} />
          {isAdmin && (
            <Badge variant="secondary" className="absolute -top-1.5 -right-1.5 h-4 px-1 text-[9px] leading-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md animate-pulse">
              <Crown className="h-2 w-2 mr-0.5" />
              Admin
            </Badge>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground group-hover:text-accent transition-all duration-300 truncate max-w-[120px]">
            {fullName}
          </span>
          <div className="flex items-center space-x-1">
            {isUserOnline ? <Wifi className="h-2.5 w-2.5 text-green-400" /> : <WifiOff className="h-2.5 w-2.5 text-[#EAF2FF]/60" />}
            <span className="text-xs text-muted-foreground group-hover:text-accent/70 transition-all duration-300">
              {isUserOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:rotate-180 transition-all duration-300 transform" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-80 p-3 glass border border-border/50 shadow-2xl shadow-accent/5 animate-in slide-in-from-top-2 duration-300"
        sideOffset={8}
      >
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
                <p className="text-xs text-muted-foreground">{profile?.package || 'Premium'} Plan Active</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0">
              {profile?.package || 'Pro'}
            </Badge>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Profile Actions */}
        <div className="space-y-1">
          <DropdownMenuItem onClick={handleEditProfile} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-[#1A7FB3]/20">
              <Edit3 className="h-4 w-4 text-[#1A7FB3]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Edit Profile</p>
              <p className="text-xs text-muted-foreground">Update your personal information</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleProfileSettings} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer">
            <div className="p-2 rounded-full bg-[#1E2A44]/40">
              <Settings className="h-4 w-4 text-[#EAF2FF]/70" />
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
            <DropdownMenuItem onClick={() => router.push('/admin')} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer group/admin transition-all duration-300 border border-transparent hover:border-yellow-300/50">
              <div className="p-2.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 group-hover/admin:bg-yellow-200 dark:group-hover/admin:bg-yellow-900/50 transition-all duration-300 group-hover/admin:scale-105">
                <ShieldCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400 group-hover/admin:animate-bounce transition-all duration-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium group-hover/admin:text-yellow-600 transition-colors duration-300">Admin Panel</p>
                <p className="text-xs text-muted-foreground">Access administrative functions</p>
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400 group/logout transition-all duration-300 border border-transparent hover:border-red-300/50">
          <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/30 group-hover/logout:bg-red-200 dark:group-hover/logout:bg-red-900/50 transition-all duration-300 group-hover/logout:scale-105">
            <LogOut className="h-4 w-4 group-hover/logout:-rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium group-hover/logout:text-red-700 transition-colors duration-300">Sign Out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
