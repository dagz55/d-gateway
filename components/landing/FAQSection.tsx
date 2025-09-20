'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqItems: FAQItem[] = [
    {
      question: "How do I get started with crypto trading?",
      answer: "Getting started is easy! Simply create an account, complete the verification process, and you can start trading immediately. We support over 400 cryptocurrencies with competitive fees and advanced trading tools."
    },
    {
      question: "What are the trading fees?",
      answer: "Our trading fees start from 0.1% for makers and 0.2% for takers. We offer volume-based discounts, and you can reduce fees further by holding our native token or using our premium subscription plans."
    },
    {
      question: "Is my crypto safe on the platform?",
      answer: "Security is our top priority. We use industry-leading security measures including cold storage for 95% of funds, multi-signature wallets, and advanced encryption. We're also regulated and insured for additional protection."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including bank transfers (ACH, wire), credit/debit cards, Apple Pay, Google Pay, and cryptocurrency deposits. Most USD deposits are free of charge."
    },
    {
      question: "Can I trade on mobile?",
      answer: "Yes! Our mobile app is available for both iOS and Android devices. You can trade, monitor your portfolio, set price alerts, and access all features on the go."
    },
    {
      question: "What is the minimum deposit amount?",
      answer: "The minimum deposit varies by payment method. For cryptocurrency deposits, there's no minimum. For fiat deposits, the minimum is typically $10-50 depending on your region and payment method."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="relative z-10 bg-[#0a1429] border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 text-lg">
            Got questions? We've got answers. Can't find what you're looking for?
            <a href="#" className="text-[#0577DA] hover:underline ml-1">
              Contact our support team
            </a>
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-medium text-lg pr-4">
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`text-[#0577DA] transition-transform duration-200 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${
                openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-[#0577DA]/10 to-[#1199FA]/10 rounded-2xl p-8 border border-[#0577DA]/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help you 24/7 with any questions about trading, security, or account management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#0577DA] hover:bg-[#0466c4] text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Contact Support
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
