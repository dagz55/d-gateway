'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bell,
  Edit3,
  HelpCircle,
  LogOut,
  Settings,
} from 'lucide-react';

interface AccountAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
  hoverBg: string;
}

export default function ProfileDropdown() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleAccountAction = (action: AccountAction) => {
    setIsOpen(false);
    if (action.onClick) {
      action.onClick();
      return;
    }

    if (action.href) {
      router.push(action.href);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const accountActions: AccountAction[] = [
    {
      icon: Edit3,
      label: 'Edit Profile',
      href: '/profile',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/settings',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-800/30',
      hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800/20',
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/notifications',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    },
  ];

  const isAdmin = user?.publicMetadata?.isAdmin === true || user?.publicMetadata?.role === 'admin';

  if (!isLoaded) {
    return (
      <div className="h-9 w-9 rounded-lg border-2 border-border/60 bg-muted/40 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const email =
    Array.isArray(user.emailAddresses) && user.emailAddresses.length > 0
      ? user.emailAddresses[0]?.emailAddress || ''
      : '';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style jsx global>{`
        .profile-dropdown-scroll {
          scrollbar-width: thin;
        }
      `}</style>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open profile menu"
            className="flex items-center space-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/50 rounded-lg transition-colors"
          >
            <Avatar className="h-9 w-9 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors">
              <AvatarImage src={user.imageUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[320px] sm:w-[360px] p-0 border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="profile-dropdown-scroll max-h-[85vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                  <AvatarImage src={user.imageUrl} alt={fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                   <div className="flex items-center gap-2">
                     <p className="text-sm font-bold leading-none truncate text-white dark:text-white">
                       {fullName}
                       {isAdmin && (
                         <span className="ml-2 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full">
                           Admin
                         </span>
                       )}
                     </p>
                   </div>
                  <p className="text-xs leading-none text-white/70 truncate mt-1 font-medium">
                    {email}
                  </p>
                </div>
              </div>


              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wide px-1">
                  Manage account
                </p>
                <div className="mt-2 space-y-1">
                  {accountActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start h-9 px-2 text-white dark:text-white transition-all duration-200 border border-transparent hover:scale-[1.02] hover:shadow-sm hover:border-border/40',
                        action.hoverBg
                      )}
                      onClick={() => handleAccountAction(action)}
                    >
                      <span
                        className={cn('p-1.5 rounded-full mr-3 transition-all duration-200', action.bgColor)}
                      >
                        <action.icon className={cn('h-3.5 w-3.5', action.color)} />
                      </span>
                      <span className="text-xs font-semibold">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9 px-2 text-red-400 dark:text-red-400 font-semibold transition-all duration-200 border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-[1.02] hover:shadow-sm hover:border-red-400/30"
                onClick={handleSignOut}
              >
                <span className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 mr-3 transition-all duration-200">
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                </span>
                <span className="text-xs font-semibold">Sign Out</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}