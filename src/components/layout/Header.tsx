'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <header className={`flex h-16 items-center justify-between px-6 border-b bg-background ${className}`}>
      <div className="flex items-center md:ml-0 ml-16">
        <Logo size="md" showText={false} />
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
      </div>
    </header>
  );
}
