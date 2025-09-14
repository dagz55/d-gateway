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

interface PrivacyModalProps {
  children: React.ReactNode;
}

export default function PrivacyModal({ children }: PrivacyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Information We Collect</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              
              <h4 className="font-medium mb-2">Personal Information:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
                <li>Email address and username</li>
                <li>Profile information (name, profile picture)</li>
                <li>Account preferences and settings</li>
                <li>Communication preferences</li>
              </ul>

              <h4 className="font-medium mb-2">Trading and Usage Data:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Trading signals and portfolio data</li>
                <li>Platform usage statistics</li>
                <li>Device and browser information</li>
                <li>Log data and IP addresses</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. How We Use Your Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and personalize our trading signals and analytics</li>
                <li>Process transactions and manage your account</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Information Sharing and Disclosure</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
              </p>
              
              <h4 className="font-medium mb-2">We may share your information:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>In aggregated or anonymized form for research and analytics</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Data Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Data Retention</h3>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services. 
                We may retain certain information after account closure as required by law or for legitimate business purposes, 
                including fraud prevention and compliance with regulatory requirements.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Your Rights and Choices</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have certain rights regarding your personal information:
              </p>
              
              <h4 className="font-medium mb-2">Account Information:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
                <li>Access and update your profile information</li>
                <li>Modify your communication preferences</li>
                <li>Download your data in a portable format</li>
                <li>Request deletion of your account and data</li>
              </ul>

              <h4 className="font-medium mb-2">Communication Preferences:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Opt out of promotional communications</li>
                <li>Control notification settings</li>
                <li>Manage cookie preferences</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. Cookies and Tracking Technologies</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use cookies and similar technologies to enhance your experience:
              </p>
              
              <h4 className="font-medium mb-2">Types of Cookies:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Essential:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics:</strong> Help us understand how you use our platform</li>
                <li><strong>Preferences:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing:</strong> Deliver relevant content and advertisements</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">8. Third-Party Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may integrate with third-party services for authentication, analytics, and other functionality. 
                These services have their own privacy policies, and we encourage you to review them. We are not responsible 
                for the privacy practices of third-party services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">9. International Data Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that 
                such transfers comply with applicable data protection laws and implement appropriate safeguards to 
                protect your information.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">10. Children&apos;s Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                information from children. If you are a parent or guardian and believe your child has provided us with 
                personal information, please contact us to have it removed.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">11. Changes to This Privacy Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">12. Contact Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:{' '}
                <a 
                  href="mailto:admin@zignals.org" 
                  className="text-primary hover:underline font-medium"
                >
                  admin@zignals.org
                </a>
              </p>
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Data Protection Officer:</strong> admin@zignals.org<br />
                  <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}