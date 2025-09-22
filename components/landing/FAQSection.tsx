'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle, LifeBuoy } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What are Zignals package prices?',
    answer:
      'Package pricing information is currently being finalized. Please contact our customer service representatives for the most up-to-date pricing details and to discuss which package best fits your trading needs.',
  },
  {
    question: 'What is the minimum deposit amount?',
    answer:
      'For a mere $10.00 deposit, you may be granted access to our platform. This low entry barrier ensures that traders of all levels can experience our institutional-grade signals and guided strategy.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We have multiple payment channels available. Payments can be made through the following: Crypto wallet transfers, Local Bank transfers, E-wallet transfers are also accepted.',
  },
  {
    question: 'How do I get started with crypto trading?',
    answer:
      'Create your Zignal account, complete the quick verification flow, and you can immediately access live signals in the demo workspace. Upgrade whenever you want to unlock automated execution and portfolio syncing.',
  },
  {
    question: 'Is my crypto safe on the platform?',
    answer:
      'Security is our first priority. 95% of assets sit in cold storage, multi-signature approvals are required for major actions, and every account can enable hardware-backed MFA to keep attackers out.',
  },
  {
    question: 'Can I trade on mobile?',
    answer:
      'Yes. The Zignal iOS and Android apps mirror the desktop desk so you can trigger automations, approve trades, and monitor alerts on the go.',
  },
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]));
  };

  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-[#030a18]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,153,250,0.35)_0%,transparent_65%)] opacity-40" />
      <div className="relative mx-auto max-w-5xl px-4 py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Support
          </span>
          <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Frequently asked questions</h2>
          <p className="mt-4 text-base text-white/70">
            Quick answers to the most common questions. If you need something more specific, our team is one click away.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur transition hover:border-white/25"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-white sm:text-lg">{item.question}</span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition ${
                      isOpen ? 'bg-[#0577DA]/20 text-white' : 'hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <ChevronDown className={`h-4 w-4 transition duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden px-6 pb-6 text-sm text-white/70 sm:text-base">{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-6 rounded-3xl border border-white/15 bg-white/[0.05] p-8 text-white/80 sm:grid-cols-2">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0577DA]/15 text-[#57c8ff]">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Chat with support</h3>
            <p className="mt-2 text-sm text-white/70">
              Our humans (not bots) are available 24/7 for account questions, live trade checks, and onboarding help.
            </p>
            <a
              href="mailto:support@zignal.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-white/60"
            >
              support@zignal.com
            </a>
          </div>
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#22d3ee]/15 text-[#22d3ee]">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Visit the help center</h3>
            <p className="mt-2 text-sm text-white/70">
              Step-by-step guides, best practices, and release notes to keep you ahead of the curve.
            </p>
            <a
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-white/60"
            >
              Browse articles →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
