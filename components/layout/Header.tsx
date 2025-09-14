'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="flex items-center gap-2 glass-hover border-border focus:ring-2 focus:ring-accent transition-all duration-300"
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
        <ProfileDropdown />
      </div>
    </header>
  );
}