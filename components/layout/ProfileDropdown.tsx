'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Crown } from 'lucide-react';

export default function ProfileDropdown() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <>
      <style jsx global>{`
        /* Profile dropdown container styles with improved contrast */
        .cl-userButtonPopoverCard {
          z-index: 9999 !important;
          margin-top: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.12) !important;
          background-color: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Menu item styles with WCAG AA compliant contrast */
        .cl-userButtonPopoverActionButton {
          color: #1f2937 !important; /* Gray 800 - contrast ratio 12.63:1 on white */
          font-weight: 500 !important;
          padding: 10px 16px !important;
          position: relative !important;
          transition: all 0.2s ease !important;
        }
        
        .cl-userButtonPopoverActionButton:hover {
          background-color: #f3f4f6 !important; /* Gray 100 */
          color: #111827 !important; /* Gray 900 for even better contrast on hover */
        }
        
        .cl-userButtonPopoverActionButton:focus-visible {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px !important;
        }
        
        /* Dark mode styles with improved contrast */
        @media (prefers-color-scheme: dark) {
          .cl-userButtonPopoverCard {
            background-color: #1f2937 !important; /* Gray 800 */
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          
          .cl-userButtonPopoverActionButton {
            color: #f9fafb !important; /* Gray 50 - contrast ratio 15.3:1 on gray-800 */
          }
          
          .cl-userButtonPopoverActionButton:hover {
            background-color: #374151 !important; /* Gray 700 */
            color: #ffffff !important; /* Pure white for maximum contrast */
          }
        }
        
        /* Header text styles */
        .cl-userButtonPopoverHeaderTitle {
          color: #111827 !important;
          font-weight: 600 !important;
        }
        
        .cl-userButtonPopoverHeaderSubtitle {
          color: #4b5563 !important; /* Gray 600 - meets WCAG AA for small text */
        }
        
        @media (prefers-color-scheme: dark) {
          .cl-userButtonPopoverHeaderTitle {
            color: #f9fafb !important;
          }
          
          .cl-userButtonPopoverHeaderSubtitle {
            color: #d1d5db !important; /* Gray 300 - good contrast on dark */
          }
        }
      `}</style>
      
      <div className="relative">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors relative",
              userButtonPopoverCard: "shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-[9999] mt-2",
              userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50 py-2.5 px-4 font-medium",
              userButtonPopoverActionButtonText: "text-gray-900 dark:text-gray-50 font-medium",
              userButtonPopoverFooter: "hidden",
              userButtonPopoverMain: "bg-white dark:bg-gray-800",
              userButtonPopoverHeader: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
              userButtonPopoverHeaderTitle: "text-gray-900 dark:text-gray-50 font-semibold",
              userButtonPopoverHeaderSubtitle: "text-gray-600 dark:text-gray-300",
            },
          }}
          afterSignOutUrl="/"
          userProfileMode="navigation"
          userProfileUrl="/profile"
        />
        
        {/* Admin crown badge */}
        {isAdmin && (
          <div 
            className="absolute -top-1 -right-1 z-10"
            aria-label="Admin account"
          >
            <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 ring-2 ring-white dark:ring-gray-800 shadow-sm">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
