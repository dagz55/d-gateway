import { FunctionalLanding } from "@/components/landing/FunctionalLanding"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1F]/90 backdrop-blur-md border-b border-[#33E1DA]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#33E1DA] to-[#1A7FB3] rounded-lg flex items-center justify-center">
              <span className="text-[#0A0F1F] font-bold text-sm">Z</span>
            </div>
            <span className="text-[#EAF2FF] font-bold text-xl">Zignal</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-[#EAF2FF]/80 hover:text-[#33E1DA] transition-colors">
              Features
            </Link>
            <Link href="#security" className="text-[#EAF2FF]/80 hover:text-[#33E1DA] transition-colors">
              Security
            </Link>
            <Link href="#about" className="text-[#EAF2FF]/80 hover:text-[#33E1DA] transition-colors">
              About
            </Link>
            <Link href="#testimonials" className="text-[#EAF2FF]/80 hover:text-[#33E1DA] transition-colors">
              Reviews
            </Link>
          </div>

          {/* Auth Button */}
          <Link
            href="/auth"
            className="px-6 py-2 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Login / Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Landing Content */}
      <main className="pt-16">
        <FunctionalLanding />
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0F1F] border-t border-[#33E1DA]/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#33E1DA] to-[#1A7FB3] rounded-lg flex items-center justify-center">
                  <span className="text-[#0A0F1F] font-bold text-sm">Z</span>
                </div>
                <span className="text-[#EAF2FF] font-bold text-xl">Zignal</span>
              </div>
              <p className="text-[#EAF2FF]/60 text-sm">
                Professional cryptocurrency trading signals for everyone.
              </p>
            </div>

            <div>
              <h4 className="text-[#EAF2FF] font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-[#EAF2FF]/60">
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Trading Signals</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Market Analysis</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Portfolio Tracking</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#EAF2FF] font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[#EAF2FF]/60">
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">API Documentation</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#EAF2FF] font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#EAF2FF]/60">
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-[#33E1DA] transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#33E1DA]/20 mt-8 pt-8 text-center">
            <p className="text-[#EAF2FF]/60 text-sm">
              © 2024 Zignal. All rights reserved. Professional trading signals platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}