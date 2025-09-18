'use client'

import { SophisticatedLanding } from "@/components/landing/SophisticatedLanding"
import { useRouter } from 'next/navigation'

export default function SophisticatedLandingPage() {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Sophisticated landing page as main content */}
      <SophisticatedLanding />
      
      {/* Auth card as overlay/modal trigger */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          className="px-6 py-3 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() => {
            // Could trigger a modal or navigate to auth page
            router.push('/auth');
          }}
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  )
}