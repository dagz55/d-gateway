"use client"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the main landing component for better initial load performance
const ZignalLanding = dynamic(() => import("@/components/landing/ZignalLanding").then(mod => ({ default: mod.ZignalLanding })), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen bg-[#040918] flex items-center justify-center">
      <div className="text-white/50 text-lg">Loading Zignal...</div>
    </div>
  )
});

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#040918] flex items-center justify-center">
        <div className="text-white/50 text-lg">Loading Zignal...</div>
      </div>
    }>
      <ZignalLanding />
    </Suspense>
  )
}