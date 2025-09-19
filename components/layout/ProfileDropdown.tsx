'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

export default function ProfileDropdown() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="flex items-center space-x-3">
      {isAdmin && (
        <Badge variant="secondary" className="h-6 px-2 text-xs flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <Crown className="h-3 w-3" /> Admin
        </Badge>
      )}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors",
            userButtonPopoverCard: "shadow-xl border border-gray-200 dark:border-gray-800",
            userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-gray-800",
            userButtonPopoverActionButtonText: "text-gray-700 dark:text-gray-300",
            userButtonPopoverFooter: "hidden",
          },
        }}
        afterSignOutUrl="/"
        userProfileMode="navigation"
        userProfileUrl="/profile"
      />
    </div>
  );
}