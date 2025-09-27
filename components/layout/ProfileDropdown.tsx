'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Crown } from 'lucide-react';

export default function ProfileDropdown() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <>
      <style jsx global>{`
        /* Enhanced glassmorphic profile dropdown styles */
        .cl-userButtonPopoverCard {
          z-index: 9999 !important;
          margin-top: 8px !important;
          background: rgba(30, 42, 68, 0.25) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(51, 225, 218, 0.15) !important;
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 0 0 1px rgba(51, 225, 218, 0.05) !important;
          border-radius: 12px !important;
        }
        
        /* Menu item styles with glassmorphic theme */
        .cl-userButtonPopoverActionButton {
          color: #eaf2ff !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
          position: relative !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border-radius: 8px !important;
          margin: 4px 8px !important;
        }
        
        .cl-userButtonPopoverActionButton:hover {
          background: rgba(51, 225, 218, 0.1) !important;
          color: #ffffff !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(51, 225, 218, 0.2) !important;
        }
        
        .cl-userButtonPopoverActionButton:focus-visible {
          outline: 2px solid #33e1da !important;
          outline-offset: 2px !important;
        }
        
        /* Header styles with proper contrast */
        .cl-userButtonPopoverHeaderTitle {
          color: #eaf2ff !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .cl-userButtonPopoverHeaderSubtitle {
          color: rgba(234, 242, 255, 0.7) !important;
          font-size: 14px !important;
        }
        
        /* Footer styles */
        .cl-userButtonPopoverFooter {
          border-top: 1px solid rgba(51, 225, 218, 0.1) !important;
          background: rgba(26, 127, 179, 0.05) !important;
          padding: 12px 16px !important;
        }
        
        /* Avatar styling */
        .cl-userButtonPopoverAvatar {
          border: 2px solid rgba(51, 225, 218, 0.3) !important;
          box-shadow: 0 0 20px rgba(51, 225, 218, 0.2) !important;
        }
        
        /* Development mode banner */
        .cl-userButtonPopoverFooter .cl-userButtonPopoverActionButton {
          background: rgba(245, 158, 11, 0.15) !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
          color: #f59e0b !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
          margin: 0 !important;
          border-radius: 6px !important;
        }
        
        /* Clerk branding */
        .cl-userButtonPopoverFooter .cl-userButtonPopoverActionButton:first-child {
          background: transparent !important;
          border: none !important;
          color: rgba(234, 242, 255, 0.6) !important;
          font-size: 11px !important;
        }
      `}</style>
      
      <div className="relative">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 rounded-lg border-2 border-border/50 hover:border-accent transition-colors relative glass-card",
              userButtonPopoverCard: "glass-card glass-hover z-[9999] mt-2",
              userButtonPopoverActionButton: "hover:bg-accent/10 text-foreground py-2.5 px-4 font-medium",
              userButtonPopoverActionButtonText: "text-foreground font-medium",
              userButtonPopoverFooter: "border-t border-border/50 bg-primary/5",
              userButtonPopoverMain: "glass-card",
              userButtonPopoverHeader: "glass-card border-b border-border/50",
              userButtonPopoverHeaderTitle: "text-foreground font-semibold",
              userButtonPopoverHeaderSubtitle: "text-muted-foreground",
              userButtonPopoverAvatar: "border-2 border-accent/30 shadow-lg",
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
