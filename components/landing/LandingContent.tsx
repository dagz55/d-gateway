'use client';

import { useState } from 'react';
import Logo from '@/components/ui/Logo';
import { LiveSignalsChart } from './LiveSignalsChart';
import { PromotionalBanner } from './PromotionalBanner';
import { PriceConverter } from './PriceConverter';
import { CryptoPriceCard } from './CryptoPriceCard';
import { FeatureHighlights } from './FeatureHighlights';
import { FAQSection } from './FAQSection';

export function LandingContent() {
  const [cryptoPrices] = useState([
    { symbol: 'BTC', name: 'Bitcoin', price: '115,782.93', change: '-0.77%', marketCap: '$2,306,777,649,371.17' },
    { symbol: 'ETH', name: 'Ethereum', price: '4,471.69', change: '-1.31%', marketCap: '$539,749,941,707.40' },
    { symbol: 'XRP', name: 'XRP', price: '3.00', change: '-1.11%', marketCap: '$179,492,030,212.14' },
    { symbol: 'SOL', name: 'Solana', price: '239.21', change: '-1.93%', marketCap: '$129,899,502,213.55' },
    { symbol: 'CRO', name: 'Cronos', price: '0.232679', change: '-0.34%', marketCap: '$8,100,649,111.74' },
  ]);

  return (
    <div className="relative z-10 flex-1 flex flex-col bg-[#061121] min-h-screen">
      {/* Navigation Header */}
      <nav className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="lg" textClassName="gradient-text font-semibold" enableAnimations={true} />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#support" className="text-gray-300 hover:text-white transition-colors">Support</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <a
                href="/sign-in"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Sign In
              </a>
              <a
                href="/sign-up"
                className="bg-gradient-to-r from-[#0577DA] to-[#1199FA] hover:from-[#0466c4] hover:to-[#0e8ae6] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061121] via-[#0a1a3a] to-[#061121]"></div>
        <div className="absolute inset-0 opacity-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230577DA' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>

        {/* Main Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left side - Hero Content */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-[#0577DA] to-[#1199FA] bg-clip-text text-transparent">
                      Cryptocurrency
                    </span>
                    <br />
                    <span className="text-white">Trading Made</span>
                    <br />
                    <span className="text-white">Simple</span>
                  </h1>
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Experience risk-free trading with our professional trade signals packages. Clear, reliable signals that make trading easier and more profitable.
                  </p>
                </div>

                {/* Feature Highlights */}
                <FeatureHighlights />
              </div>

              {/* Right side - Call to Action */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md space-y-6">
                  {/* Trading Dashboard Preview */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Get Trade Signals Packages</h3>
                    <p className="text-gray-300 text-sm mb-6">
                      Join thousands of traders mastering cryptocurrency with our expert guidance and reliable signals.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <a
                        href="/sign-up"
                        className="w-full bg-gradient-to-r from-[#0577DA] to-[#1199FA] hover:from-[#0466c4] hover:to-[#0e8ae6] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center group"
                      >
                        Get Started Free
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>

                      <a
                        href="/sign-in"
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center border border-white/20"
                      >
                        Sign In
                      </a>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Real-time trading signals
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Advanced charting tools
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Portfolio analytics
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          24/7 market analysis
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Converter Section */}
            <div className="mb-16">
              <PriceConverter />
            </div>

            {/* Crypto Prices Section */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Buy Bitcoin, Ethereum, and 400+ cryptocurrencies</h2>
                <button className="bg-[#0577DA] hover:bg-[#0466c4] text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                  Check Crypto Prices
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {cryptoPrices.map((crypto) => (
                  <CryptoPriceCard key={crypto.symbol} {...crypto} />
                ))}
              </div>
            </div>

            {/* Live Signals Chart */}
            <div className="mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <LiveSignalsChart />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Security Section */}
      <section className="relative z-10 bg-gradient-to-b from-[#061121] to-[#0a1429] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              SITE SECURITY
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              HOW WE MAKE SURE YOUR FUNDS AND INFORMATION ARE SAFE WITH US
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0577DA]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Payment Processing</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                All payments are processed through secure gateways to protect your financial information.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0577DA]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Data Encryption</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Personal details are encrypted and never shared with third parties.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0577DA]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Multi-Layer Security</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Multi-layer security, including strong password encryption and optional 2FA.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0577DA]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Platform Monitoring</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We have a dedicated team that will regularly monitor and moderate our platform to protect Zignal members from scams or malicious activity.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0577DA]/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Trust & Transparency</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Honest results, no hidden tricks because we prioritize building trust within our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative z-10 bg-gradient-to-b from-[#0a1429] to-[#061121] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#0577DA] to-[#1199FA] rounded-full mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To guide every trader with clear and reliable cryptocurrency trading signals in order to make trading easier, straight to the point, and more profitable while building a supportive community that grows together.
              </p>
            </div>

            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1199FA] to-[#0577DA] rounded-full mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To be the go-to crypto signals hub for everyone. We are data-driven, trustworthy, and innovative in the cryptocurrency space. We do this by paving the way for financial freedom for Zignal members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="relative z-10 bg-[#0a1429] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold mb-4">Zignal</h3>
              <p className="text-gray-400 mb-4">
                Making cryptocurrency trading simple with clear, reliable signals and expert guidance for every trader.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#0577DA] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#0577DA] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#0577DA] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Level Up</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Crypto Basket</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Earn</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Trading</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-[#0577DA] transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Zignal. All rights reserved. Professional crypto trading signals.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-[#0577DA] transition-colors">Privacy Notice</a>
                <a href="#" className="hover:text-[#0577DA] transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-[#0577DA] transition-colors">Legal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
