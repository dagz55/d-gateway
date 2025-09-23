'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

export default function ProfileDropdown() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <>
      <style jsx global>{`
        .cl-userButtonPopoverCard {
          z-index: 9999 !important;
          margin-top: 8px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        .cl-userButtonPopoverActionButton {
          color: rgb(17 24 39) !important;
          font-weight: 500 !important;
          padding: 8px 12px !important;
        }
        .cl-userButtonPopoverActionButton:hover {
          background-color: rgb(243 244 246) !important;
        }
        @media (prefers-color-scheme: dark) {
          .cl-userButtonPopoverActionButton {
            color: rgb(243 244 246) !important;
          }
          .cl-userButtonPopoverActionButton:hover {
            background-color: rgb(31 41 55) !important;
          }
        }
      `}</style>
      <div className="flex items-center space-x-3 relative">
      {isAdmin && (
        <Badge variant="secondary" className="h-6 px-2 text-xs flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <Crown className="h-3 w-3" /> Admin
        </Badge>
      )}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors",
            userButtonPopoverCard: "shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-[9999] mt-2",
            userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3",
            userButtonPopoverActionButtonText: "text-gray-900 dark:text-gray-100 font-medium",
            userButtonPopoverFooter: "hidden",
            userButtonPopoverMain: "bg-white dark:bg-gray-900",
            userButtonPopoverHeader: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
            userButtonPopoverHeaderTitle: "text-gray-900 dark:text-gray-100 font-semibold",
            userButtonPopoverHeaderSubtitle: "text-gray-600 dark:text-gray-400",
          },
        }}
        afterSignOutUrl="/"
        userProfileMode="navigation"
        userProfileUrl="/profile"
      />
      </div>
    </>
  );
}