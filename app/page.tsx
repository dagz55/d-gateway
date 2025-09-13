import { AuthCard } from "@/components/AuthCard"
import { HeroSection } from "@/components/HeroSection"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero Section */}
      <HeroSection />

      {/* Right Panel - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-[#0A0F1F]">
        <AuthCard />
      </div>
    </div>
  )
}
