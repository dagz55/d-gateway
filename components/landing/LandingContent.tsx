'use client';

import { LiveSignalsChart } from './LiveSignalsChart';
import { LoginPanel } from './LoginPanel';
import { PromotionalBanner } from './PromotionalBanner';

export function LandingContent() {
  return (
    <div className="relative z-10 flex-1 flex flex-col">
      {/* Promotional Banner at the top */}
      <PromotionalBanner />
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Live signals and content */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-[#33E1DA] to-[#10b981] bg-clip-text text-transparent">
                  Zignal
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Your gateway to professional cryptocurrency trading signals
              </p>
              <p className="text-lg text-blue-200">
                Join thousands of traders who trust Zignal for accurate, real-time crypto signals
              </p>
            </div>
            
            {/* Live signals chart */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <LiveSignalsChart />
            </div>
          </div>
          
          {/* Right side - Login panel */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <LoginPanel />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-blue-200">
        <p className="text-sm">
          © 2024 Zignal. All rights reserved. Professional crypto trading signals.
        </p>
      </footer>
    </div>
  );
}
