"use client"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SimplePerformanceMonitor } from '@/components/performance/SimplePerformanceMonitor';
import { ConsoleSuppress } from '@/components/utils/ConsoleSuppress';

// Lazy load the main landing component for better initial load performance
const ZignalLanding = dynamic(() => import("@/components/landing/ZignalLanding").then(mod => ({ default: mod.ZignalLanding })), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen bg-[#040918] flex items-center justify-center">
      <div className="text-white/50 text-lg animate-pulse">Loading Zignal...</div>
    </div>
  )
});

// Fallback component with optimized styling
const LandingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#040918] via-[#071635] to-[#02040B] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-[#33E1DA]/30 border-t-[#33E1DA] rounded-full animate-spin mx-auto"></div>
      <div className="text-white/70 text-lg font-medium">Loading Zignal...</div>
      <div className="text-[#33E1DA]/60 text-sm">Optimizing for best performance</div>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <>
      <ConsoleSuppress />
      <Suspense fallback={<LandingFallback />}>
        <ZignalLanding />
      </Suspense>
      
      {/* Performance monitoring in development */}
      <SimplePerformanceMonitor showUI={process.env.NODE_ENV === 'development'} />
    </>
  )
}