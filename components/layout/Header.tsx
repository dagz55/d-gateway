'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Logo from '@/components/ui/Logo';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import { HEADER_BANNERS } from '@/config/header-banners';
import { LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  className?: string;
}


export default function Header({ className }: HeaderProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'paused' | 'exiting'>('entering');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const cycleBanner = () => {
      // Phase 1: Enter animation (1s)
      setAnimationPhase('entering');

      setTimeout(() => {
        // Phase 2: Pause for 5 seconds
        setAnimationPhase('paused');

        setTimeout(() => {
          // Phase 3: Exit animation (1s)
          setAnimationPhase('exiting');

          setTimeout(() => {
            // Move to next banner and restart cycle
            setCurrentBanner((prev) => (prev + 1) % HEADER_BANNERS.length);
            setAnimationPhase('entering');
          }, 1000);
        }, 5000);
      }, 1000);
    };

    // Start the first cycle immediately
    const initialTimer = setTimeout(cycleBanner, 100);

    // Set up recurring cycles
    const interval = setInterval(cycleBanner, 7000); // 1s enter + 5s pause + 1s exit = 7s total

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const banner = HEADER_BANNERS[currentBanner];
  const Icon = banner.icon;

  const getAnimationClass = () => {
    switch (animationPhase) {
      case 'entering':
        return 'animate-slide-in';
      case 'paused':
        return 'animate-gentle-pulse';
      case 'exiting':
        return 'animate-slide-out';
      default:
        return '';
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-out {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.2);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 8px rgba(var(--accent-rgb), 0);
          }
        }

        .animate-slide-in {
          animation: slide-in 1s ease-out forwards;
        }

        .animate-slide-out {
          animation: slide-out 1s ease-in forwards;
        }

        .animate-gentle-pulse {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <header className={`relative flex h-16 items-center justify-between px-6 glass border-b border-border overflow-hidden ${className}`}>
        {/* Logo Section - Removed redundant logo, keeping only the title */}
        <div className="flex items-center z-10">
          <h1 className="text-xl font-bold gradient-text hidden sm:block">Zignal Dashboard</h1>
        </div>

        {/* Animated Banner Section */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <div className="relative w-full max-w-lg mx-auto overflow-hidden">
            <div
              className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border backdrop-blur-sm transition-all duration-300 cursor-pointer pointer-events-auto ${
                isHovered ? 'scale-105 shadow-lg' : ''
              } ${getAnimationClass()} ${banner.bgColor} ${banner.borderColor}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                animationPlayState: isHovered ? 'paused' : 'running'
              }}
              role="banner"
              aria-live="polite"
              aria-label={`Trading update: ${banner.text}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Could add action here if needed
                }
              }}
            >
              <Icon className={`h-4 w-4 ${banner.color} flex-shrink-0`} />
              <span className={`text-xs sm:text-sm font-medium ${banner.color} whitespace-nowrap truncate max-w-xs sm:max-w-none`}>
                {banner.text}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard, Notifications and Profile Section */}
        <div className="flex items-center space-x-2 z-10">
          {/* Dashboard Button */}
          <Link 
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          {/* Mobile Dashboard Button - Icon only */}
          <Link 
            href="/dashboard"
            className="flex sm:hidden items-center justify-center p-2 text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </header>
    </>
  );
}
