"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrivacyModalProps {
  children: React.ReactNode
}

export function PrivacyModal({ children }: PrivacyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#1E2A44] border-[#33E1DA]/20">
        <DialogHeader>
          <DialogTitle className="text-[#EAF2FF] text-xl">Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-[#EAF2FF]/80 text-sm leading-relaxed">
            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, subscribe to our
                service, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Name and email address</li>
                <li>Account credentials and authentication information</li>
                <li>Payment and billing information</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">3. Information Sharing</h3>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>With service providers who assist us in operating our platform</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">4. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">5. Cookies and Tracking</h3>
              <p>
                We use cookies and similar tracking technologies to collect and use personal information about you. You
                can control cookies through your browser settings, but disabling cookies may affect the functionality of
                our service.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">6. Data Retention</h3>
              <p>
                We retain your personal information for as long as necessary to provide our services, comply with legal
                obligations, resolve disputes, and enforce our agreements. When we no longer need your information, we
                will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">7. Your Rights</h3>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>The right to access and receive a copy of your personal information</li>
                <li>The right to rectify or update your personal information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to our processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">8. International Transfers</h3>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">9. Changes to This Policy</h3>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the
                new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h3 className="text-[#33E1DA] font-semibold mb-2">10. Contact Us</h3>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at
                privacy@zignal.com.
              </p>
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
