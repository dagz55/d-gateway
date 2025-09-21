'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Instant-loading hero section for critical FCP
export const InstantHero = memo(() => {
  return (
    <div className="landing-hero">
      <nav className="landing-nav">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#57c8ff] via-[#1199FA] to-[#6d5efc] bg-clip-text text-transparent">
              Zignal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-white/70 hover:text-white text-sm font-medium">
              Sign In
            </Link>
            <Link href="/sign-up" className="cta-button text-sm">
              Join Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="landing-content">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-white/60 mb-6">
              <span className="w-2 h-2 bg-[#57c8ff] rounded-full animate-pulse"></span>
              LIVE CRYPTO SIGNALS REIMAGINED
            </div>
            
            <h1 className="hero-title">
              Trade the moment
              <span className="block bg-gradient-to-r from-[#57c8ff] via-[#1199FA] to-[#6d5efc] bg-clip-text text-transparent">
                clarity meets confidence
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Zignal brings institutional-grade signals, guided strategy, and built-in risk controls together in one effortless workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up" className="cta-button">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#live-signals" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 rounded-xl text-white/80 hover:text-white hover:border-white/30 font-semibold">
                <div className="w-5 h-5 rounded-full border-2 border-[#57c8ff] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#57c8ff] rounded-full"></div>
                </div>
                Watch signal desk
              </a>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">184K+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Active traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">72.4%</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Avg. win rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-white">12.8M</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Signals delivered</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-[#1e2a44]/60 to-[#0a0f1f]/60 backdrop-blur border border-white/15 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Signal workspace</div>
                  <div className="text-lg font-semibold text-white mt-1">Pro momentum strategy</div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/15 border border-green-500/30 rounded-full text-xs font-semibold text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </div>
              </div>
              
              <div className="h-32 bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                <div className="w-full h-16 bg-gradient-to-r from-[#57c8ff]/20 to-[#34d399]/20 rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-xs text-white/50">Running P&L</div>
                  <div className="text-lg font-semibold text-green-400">+18.4%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50">Risk per trade</div>
                  <div className="text-lg font-semibold text-white">1.2%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  { pair: 'BTC/USDT', change: '+4.2%', positive: true },
                  { pair: 'ETH/USDT', change: '+2.8%', positive: true },
                  { pair: 'SOL/USDT', change: '-1.6%', positive: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="text-sm font-medium text-white">{item.pair}</div>
                    <div className={`text-sm font-semibold ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InstantHero.displayName = 'InstantHero';
