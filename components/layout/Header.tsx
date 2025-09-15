'use client';

import Logo from '@/components/ui/Logo';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`flex h-16 items-center justify-between px-6 glass border-b border-border ${className}`}>
      <div className="flex items-center md:ml-0 ml-16">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">Z</span>
          </div>
          <h1 className="text-xl font-bold gradient-text hidden sm:block">Zignal Dashboard</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <ProfileDropdown />
      </div>
    </header>
  );
}