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
import { Mail, MessageSquare, Clock, HelpCircle } from 'lucide-react';

interface SupportModalProps {
  children: React.ReactNode;
}

export default function SupportModal({ children }: SupportModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support & Help
          </DialogTitle>
          <DialogDescription>
            Get help with your Zignal account and trading platform
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            {/* Contact Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <Mail className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold text-base">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Get personalized help from our support team
                  </p>
                  <a 
                    href="mailto:admin@zignals.org?subject=Zignal Support Request"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    admin@zignals.org
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 border rounded-lg">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Response Time</h4>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <details className="group border border-border rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
                    How do I reset my password?
                    <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>
                      Click the "Forgot password?" link on the login page, enter your email address, 
                      and follow the instructions in the reset email. If you don't receive the email, 
                      check your spam folder or contact support.
                    </p>
                  </div>
                </details>

                <details className="group border border-border rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
                    How do trading signals work?
                    <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>
                      Trading signals are recommendations based on technical and fundamental analysis. 
                      Each signal includes entry points, stop-loss levels, and take-profit targets. 
                      Remember, all trading involves risk and signals are not guarantees of profit.
                    </p>
                  </div>
                </details>

                <details className="group border border-border rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
                    How do I update my profile information?
                    <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>
                      Go to Settings from the main menu, then select "Profile" to update your 
                      personal information, change your username, or upload a profile picture.
                    </p>
                  </div>
                </details>

                <details className="group border border-border rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
                    Is my data secure?
                    <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>
                      Yes, we use industry-standard encryption and security measures to protect your data. 
                      We never store sensitive financial information and all data is encrypted both in 
                      transit and at rest. See our Privacy Policy for more details.
                    </p>
                  </div>
                </details>

                <details className="group border border-border rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
                    Can I delete my account?
                    <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>
                      Yes, you can request account deletion by contacting our support team at 
                      admin@zignals.org. We'll permanently delete your account and personal data 
                      within 30 days of your request, as required by privacy regulations.
                    </p>
                  </div>
                </details>
              </div>
            </section>

            {/* When to Contact Support */}
            <section>
              <h3 className="font-semibold text-base mb-3">When to Contact Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Technical issues or bugs with the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Questions about trading signals or platform features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Account access problems or security concerns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Billing or subscription inquiries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Feedback or suggestions for improvement</span>
                </li>
              </ul>
            </section>

            {/* Contact Form */}
            <section className="border-t pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  For immediate assistance, click the button below to send us an email:
                </p>
                <Button asChild>
                  <a href="mailto:admin@zignals.org?subject=Zignal Support Request&body=Hi Zignal Support Team,%0D%0A%0D%0APlease describe your issue or question here:%0D%0A%0D%0AAccount Email: %0D%0ADevice/Browser: %0D%0ADescription of Issue: %0D%0A%0D%0AThank you for your help!">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Support Email
                  </a>
                </Button>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}