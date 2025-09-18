import { WorkOSAuthCard } from "@/components/WorkOSAuthCard"
import { SlideIn, ScaleIn } from "@/components/animations/TextAnimations"
import { FloatingCryptoIcons } from "@/components/animations/CryptoIcons"
import Link from "next/link"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3] relative overflow-hidden">
      {/* Background elements */}
      <FloatingCryptoIcons className="opacity-10" count={15} />
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/"
          className="px-4 py-2 bg-[#1E2A44]/80 text-[#EAF2FF] rounded-lg hover:bg-[#33E1DA] hover:text-[#0A0F1F] transition-all duration-300"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <SlideIn direction="down" className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#EAF2FF] mb-2">Welcome to Zignal</h1>
            <p className="text-[#EAF2FF]/70">Sign in to access professional crypto signals</p>
          </SlideIn>
          
          <ScaleIn delay={300}>
            <WorkOSAuthCard />
          </ScaleIn>
        </div>
      </div>
    </div>
  )
}