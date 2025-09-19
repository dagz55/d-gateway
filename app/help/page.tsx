'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Shield,
  CreditCard,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: "How do I get started with Zignal?",
      answer: "Getting started is easy! Sign up for an account, complete your profile, and you'll have access to our trading signals and analytics dashboard. Start with our beginner-friendly signals and gradually explore advanced features."
    },
    {
      question: "What are trading signals and how do they work?",
      answer: "Trading signals are recommendations based on technical analysis and market data. Our AI-powered system analyzes market trends and provides entry/exit points for various cryptocurrency trades. Each signal includes risk assessment and profit targets."
    },
    {
      question: "How do I manage my wallet and deposits?",
      answer: "Navigate to the Wallet section in your dashboard to view balances, make deposits, or request withdrawals. We support multiple payment methods and cryptocurrencies. All transactions are secured and processed within 24 hours."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer flexible plans based on your trading needs: Basic (free signals), Pro (advanced analytics), and Enterprise (custom solutions). Each plan includes different signal frequencies and features."
    },
    {
      question: "How can I track my trading performance?",
      answer: "Your dashboard provides comprehensive analytics including profit/loss tracking, win rate statistics, and performance metrics. You can view historical data and export reports for tax purposes."
    },
    {
      question: "Is my account and data secure?",
      answer: "Yes! We use bank-level encryption, two-factor authentication, and follow industry best practices for security. Your personal information and trading data are fully protected."
    }
  ];

  const supportCategories = [
    {
      icon: TrendingUp,
      title: "Trading & Signals",
      description: "Questions about signals, strategies, and trading",
      topics: ["Signal interpretation", "Risk management", "Market analysis"]
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Account billing, subscriptions, and payment issues",
      topics: ["Subscription plans", "Payment methods", "Refunds"]
    },
    {
      icon: Settings,
      title: "Account & Settings",
      description: "Profile management and account configuration",
      topics: ["Profile setup", "Security settings", "Notifications"]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Account security and privacy concerns",
      topics: ["Two-factor auth", "Data protection", "Account recovery"]
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-[#33E1DA]" />
            <h1 className="text-4xl font-bold text-white">Help & Support</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Get help with your Zignal account, trading signals, and platform features. 
            Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <Input
            placeholder="Search help articles and FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Support Categories */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#33E1DA]" />
                  Browse by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {supportCategories.map((category, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#33E1DA]/10">
                          <category.icon className="w-5 h-5 text-[#33E1DA]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{category.title}</h3>
                          <p className="text-white/60 text-sm mb-2">{category.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {category.topics.map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="secondary" className="text-xs bg-white/10 text-white/70">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-white/60">
                  Find quick answers to the most common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronDown className="w-5 h-5 text-[#33E1DA]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/40" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 text-white/70 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#33E1DA]" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#33E1DA]" />
                    <span className="text-white font-medium">Email Support</span>
                  </div>
                  <p className="text-white/60 text-sm mb-2">Get help via email</p>
                  <p className="text-[#33E1DA] text-sm">support@zignals.org</p>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#33E1DA]" />
                    <span className="text-white font-medium">Live Chat</span>
                  </div>
                  <p className="text-white/60 text-sm mb-3">Chat with our team</p>
                  <Button className="w-full bg-[#33E1DA] hover:bg-[#33E1DA]/80 text-black">
                    Start Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    Getting Started Guide
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    Trading Tutorials
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    API Documentation
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    Community Forum
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    Status Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="text-white/70">
                  <p className="mb-1">Monday - Friday: 9 AM - 6 PM EST</p>
                  <p className="mb-1">Saturday: 10 AM - 4 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
                <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-xs">Currently Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
