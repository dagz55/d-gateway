'use client';

import { useUser } from '@clerk/nextjs';

export default function AdminWelcomeHeader() {
  const { user } = useUser();

  return (
    <div className="glass-header p-8 animate-fade-in group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 glass-subtle rounded-full flex items-center justify-center animate-float">
            <div className="w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Admin Dashboard
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-accent to-primary rounded-full mt-2 opacity-60" />
          </div>
        </div>

        <div className="glass-subtle px-4 py-2 rounded-full">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">System Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg text-white/80 font-medium">
          Welcome back,{' '}
          <span className="gradient-text font-semibold">
            {user?.firstName || 'Admin'}
          </span>
          ! Here's what's happening with your platform.
        </p>

        <div className="glass-subtle px-6 py-3 rounded-xl">
          <div className="text-right">
            <div className="text-sm text-white/60">Last login</div>
            <div className="text-accent font-semibold">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent/30 rounded-full animate-ping" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary/30 rounded-full animate-pulse" />
    </div>
  );
}
