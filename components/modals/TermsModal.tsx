'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  children: React.ReactNode;
}

export default function TermsModal({ children }: TermsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="modal-content max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">1. Acceptance of Terms</h3>
              <p className="text-white/80 leading-relaxed">
                By accessing and using Zignal (&quot;the Service&quot;), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">2. Description of Service</h3>
              <p className="text-white/80 leading-relaxed">
                Zignal is a cryptocurrency trading signals and analytics platform that provides market analysis,
                trading recommendations, and portfolio management tools. Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside mt-2 text-white/70 space-y-1">
                <li>Trading signals and market analysis</li>
                <li>Portfolio tracking and analytics</li>
                <li>Market news and updates</li>
                <li>Educational content and resources</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">3. Risk Disclosure</h3>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-destructive mb-2">IMPORTANT RISK WARNING</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Cryptocurrency trading involves substantial risk of loss and is not suitable for every investor. 
                  The valuation of cryptocurrencies and futures may fluctuate, and, as a result, you may lose more 
                  than your original investment. Past performance is not indicative of future results. Before deciding 
                  to trade cryptocurrencies, you should carefully consider your investment objectives, level of experience, 
                  and risk appetite.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">4. User Responsibilities</h3>
              <p className="text-white/80 leading-relaxed">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for:
              </p>
              <ul className="list-disc list-inside mt-2 text-white/70 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your use complies with applicable laws and regulations</li>
                <li>Making independent investment decisions based on your own research</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">5. Intellectual Property</h3>
              <p className="text-white/80 leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of Zignal and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">6. Prohibited Uses</h3>
              <p className="text-white/80 leading-relaxed">You may not use our Service:</p>
              <ul className="list-disc list-inside mt-2 text-white/70 space-y-1">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">7. Disclaimer of Warranties</h3>
              <p className="text-white/80 leading-relaxed">
                THE INFORMATION, SOFTWARE, PRODUCTS, AND SERVICES INCLUDED IN OR AVAILABLE THROUGH THE SERVICE 
                MAY INCLUDE INACCURACIES OR TYPOGRAPHICAL ERRORS. CHANGES ARE PERIODICALLY ADDED TO THE INFORMATION HEREIN. 
                ZIGNAL AND/OR ITS SUPPLIERS MAY MAKE IMPROVEMENTS AND/OR CHANGES IN THE SERVICE AT ANY TIME.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">8. Limitation of Liability</h3>
              <p className="text-white/80 leading-relaxed">
                IN NO EVENT SHALL ZIGNAL, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY 
                DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM 
                ANY TRADING DECISIONS MADE BASED ON INFORMATION PROVIDED THROUGH THE SERVICE.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">9. Termination</h3>
              <p className="text-white/80 leading-relaxed">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">10. Changes to Terms</h3>
              <p className="text-white/80 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
                is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-[#33E1DA]">11. Contact Information</h3>
              <p className="text-white/80 leading-relaxed">
                If you have any questions about these Terms, please contact us at:{' '}
                <a 
                  href="mailto:admin@zignals.org" 
                  className="text-primary hover:underline font-medium"
                >
                  admin@zignals.org
                </a>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}