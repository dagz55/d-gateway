'use client';

import Image from "next/image";
import { useState } from 'react';
import ProfileSection from '@/components/layout/ProfileSection';

// Mock ProfileSection component for demo purposes
function MockProfileSection({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const mockUser = {
    id: '123',
    email: 'john.doe@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  };

  const mockProfile = {
    id: '123',
    username: 'johndoe',
    full_name: 'John Doe',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'john.doe@example.com',
    is_admin: false
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    // Simulate sign out delay
    setTimeout(() => {
      setIsSigningOut(false);
      alert('Sign out successful (demo)');
    }, 1000);
  };

  const handleNavigation = (href: string) => {
    alert(`Navigate to: ${href} (demo)`);
    onNavigate?.();
  };

  const quickActions = [
    {
      label: 'Edit Profile',
      onClick: () => handleNavigation('/settings'),
      icon: 'Edit3',
    },
    {
      label: 'Account Settings',
      onClick: () => handleNavigation('/settings'),
      icon: 'Settings',
    },
    {
      label: 'Notifications',
      onClick: () => handleNavigation('/settings?tab=notifications'),
      icon: 'Bell',
    },
    {
      label: 'Security',
      onClick: () => handleNavigation('/settings?tab=security'),
      icon: 'Shield',
    },
  ];

  return (
    <div className={`border-t border-border p-4 ${className}`}>
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-accent/20">
            <Image
              src={mockProfile.avatar_url}
              alt={mockProfile.full_name || "User avatar"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {mockProfile.full_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {mockProfile.email}
          </p>
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="w-full flex items-center justify-start px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            <span className="mr-2">⚙️</span>
            {action.label}
          </button>
        ))}
        
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <span className="mr-2">{isSigningOut ? '⏳' : '🚪'}</span>
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

// Loading state demo
function LoadingProfileSection() {
  return (
    <div className="border-t border-border p-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-24 mb-2" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

// Error state demo
function ErrorProfileSection() {
  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center space-x-3 text-red-600">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium">Error Loading Profile</p>
          <p className="text-xs text-muted-foreground">Failed to load profile data</p>
        </div>
      </div>
    </div>
  );
}

// Admin user demo
function AdminProfileSection({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <div className={`border-t border-border p-4 ${className}`}>
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-accent/20">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              alt="Admin User"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Admin Badge */}
          <div className="absolute -top-1 -right-1 h-4 px-1 text-[10px] leading-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 rounded-full flex items-center">
            <span className="mr-0.5">👑</span>
            Admin
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            Admin User
          </p>
          <p className="text-xs text-muted-foreground truncate">
            admin@example.com
          </p>
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions with Admin Panel */}
      <div className="space-y-1">
        <button className="w-full flex items-center justify-start px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200">
          <span className="mr-2">✏️</span>
          Edit Profile
        </button>
        <button className="w-full flex items-center justify-start px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200">
          <span className="mr-2">⚙️</span>
          Account Settings
        </button>
        <button className="w-full flex items-center justify-start px-3 py-2 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200">
          <span className="mr-2">👑</span>
          Admin Panel
        </button>
        <button className="w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200">
          <span className="mr-2">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function ProfileSectionDemo() {
  const [currentDemo, setCurrentDemo] = useState('normal');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ProfileSection Component Demo</h1>
          <p className="text-muted-foreground">
            Interactive demonstration of the ProfileSection component in different states
          </p>
        </div>

        {/* Demo Controls */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentDemo('normal')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                currentDemo === 'normal'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Normal User
            </button>
            <button
              onClick={() => setCurrentDemo('admin')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                currentDemo === 'admin'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Admin User
            </button>
            <button
              onClick={() => setCurrentDemo('loading')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                currentDemo === 'loading'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Loading State
            </button>
            <button
              onClick={() => setCurrentDemo('error')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                currentDemo === 'error'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Error State
            </button>
          </div>
        </div>

        {/* Demo Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Desktop View */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Desktop Sidebar View</h2>
            <div className="w-64 h-96 bg-card border border-border rounded-lg overflow-hidden">
              {/* Sidebar Header */}
              <div className="h-16 border-b border-border flex items-center px-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-white">Z</span>
                  </div>
                  <h1 className="text-lg font-bold gradient-text">Zignal</h1>
                </div>
              </div>
              
              {/* Navigation Area */}
              <div className="h-48 border-b border-border p-3">
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-accent/20 text-accent rounded-lg text-sm">
                    📊 Dashboard
                  </div>
                  <div className="px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg text-sm">
                    📈 Trading Signals
                  </div>
                  <div className="px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg text-sm">
                    💼 Wallet
                  </div>
                  <div className="px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg text-sm">
                    ⚙️ Settings
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              {currentDemo === 'normal' && <MockProfileSection />}
              {currentDemo === 'admin' && <AdminProfileSection />}
              {currentDemo === 'loading' && <LoadingProfileSection />}
              {currentDemo === 'error' && <ErrorProfileSection />}
            </div>
          </div>

          {/* Mobile View */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Mobile View</h2>
            <div className="w-80 h-96 bg-card border border-border rounded-lg overflow-hidden">
              {/* Mobile Header */}
              <div className="h-12 border-b border-border flex items-center px-4">
                <button className="mr-3">☰</button>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Z</span>
                  </div>
                  <h1 className="text-sm font-bold gradient-text">Zignal</h1>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="h-64 border-b border-border p-4">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Tap menu to view sidebar</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Mobile Profile Section */}
              {currentDemo === 'normal' && <MockProfileSection />}
              {currentDemo === 'admin' && <AdminProfileSection />}
              {currentDemo === 'loading' && <LoadingProfileSection />}
              {currentDemo === 'error' && <ErrorProfileSection />}
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🖼️ Avatar Display</h3>
              <p className="text-sm text-muted-foreground">
                User profile pictures with fallback initials and proper loading states
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">👑 Admin Badge</h3>
              <p className="text-sm text-muted-foreground">
                Special visual indicator for admin users with crown icon
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🔄 Loading States</h3>
              <p className="text-sm text-muted-foreground">
                Skeleton animations during data fetching for smooth UX
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">⚠️ Error Handling</h3>
              <p className="text-sm text-muted-foreground">
                Graceful error displays with retry mechanisms
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">📱 Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Adapts perfectly to desktop and mobile screen sizes
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">♿ Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Full ARIA support and keyboard navigation compatibility
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
