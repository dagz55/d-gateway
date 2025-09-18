"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  children: React.ReactNode
}

export function TermsModal({ children }: TermsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#1E2A44] border-[#33E1DA]/20">
        <DialogHeader>
          <DialogTitle className="text-[#EAF2FF] text-xl">Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-[#EAF2FF]/80 text-sm leading-relaxed">
            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Zignal ("the Service"), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">2. Description of Service</h3>
              <p>
                Zignal provides cryptocurrency trading signals, market analysis, and related financial information. The
                Service is provided "as is" and we make no warranties or representations regarding the accuracy,
                completeness, or timeliness of the information provided.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">3. Investment Risk Disclaimer</h3>
              <p>
                <strong>IMPORTANT:</strong> Cryptocurrency trading involves substantial risk of loss and is not suitable
                for all investors. Past performance is not indicative of future results. You should carefully consider
                whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.
                You may lose all or more of your initial investment.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">4. User Responsibilities</h3>
              <p>Users are responsible for:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Maintaining the confidentiality of their account credentials</li>
                <li>All activities that occur under their account</li>
                <li>Conducting their own research before making investment decisions</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">5. Prohibited Activities</h3>
              <p>Users may not:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service without permission</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">6. Limitation of Liability</h3>
              <p>
                In no event shall Zignal, its officers, directors, employees, or agents be liable for any indirect,
                incidental, special, consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">7. Termination</h3>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever, including without limitation if you
                breach the Terms.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">8. Changes to Terms</h3>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">9. Contact Information</h3>
              <p>If you have any questions about these Terms, please contact us at legal@zignals.org.</p>
            </section>

            <div className="text-xs text-[#EAF2FF]/60 mt-8 pt-4 border-t border-[#33E1DA]/20">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
