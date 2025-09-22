'use client';

import { useEffect, useMemo, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCryptoPrices } from '@/hooks/api/useCryptoPrices';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PlayCircle,
  CreditCard,
  Lock,
  ShieldAlert,
  Fingerprint,
  HeartHandshake,
  MessageCircle,
  Users,
  UserCheck,
  LifeBuoy,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { PromotionalBanner } from './PromotionalBanner';

// Lazy load heavy components for better performance with preload hints
const OptimizedTradingChart = dynamic(() => import('@/components/trading/OptimizedTradingChart').then(mod => ({ default: mod.OptimizedTradingChart })), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse flex items-center justify-center">
      <div className="text-white/50">Loading chart...</div>
    </div>
  )
});

const PriceConverter = dynamic(() => import('./PriceConverter').then(mod => ({ default: mod.PriceConverter })), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
  )
});

const AdvancedMiniChart = dynamic(() => import('@/components/charts/AdvancedMiniChart').then(mod => ({ default: mod.AdvancedMiniChart })), {
  ssr: false,
  loading: () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          <div>
            <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-12 bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-white/10 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 bg-white/10 rounded"></div>
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-white/10 rounded"></div>
          <div className="h-3 w-16 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  )
});

const FeatureHighlights = dynamic(() => import('./FeatureHighlights').then(mod => ({ default: mod.FeatureHighlights })), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-64 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
      ))}
    </div>
  )
});

const FAQSection = dynamic(() => import('./FAQSection').then(mod => ({ default: mod.FAQSection })), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
  )
});

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About Us', href: '#mission' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
  { label: 'Support', href: '#customer-service' },
];

const heroStats = [
  { label: 'Active traders', value: '184K+', helper: 'use Zignal every week' },
  { label: 'Avg. win rate', value: '72.4%', helper: 'across pro strategies' },
  { label: 'Signals delivered', value: '12.8M', helper: 'lifetime alerts sent' },
];

const heroChecklist = [
  'Live market coverage 24/7',
  'Automated risk management',
  'Hands-on analyst insights',
  'Personalised onboarding',
];

// This will be replaced with live data

const heroPairs = [
  { pair: 'BTC/USDT', direction: 'Long', change: '+4.2%', confidence: 'High' },
  { pair: 'ETH/USDT', direction: 'Long', change: '+2.8%', confidence: 'Medium' },
  { pair: 'SOL/USDT', direction: 'Short', change: '-1.6%', confidence: 'Watch' },
];

const securityHighlights = [
  {
    icon: CreditCard,
    title: 'Secure payment processing',
    description: 'All payments are handled through audited gateways with full PCI compliance.',
  },
  {
    icon: Lock,
    title: 'Encrypted personal data',
    description: 'Every profile is protected with end-to-end encryption and strict access controls.',
  },
  {
    icon: Fingerprint,
    title: 'Multi-layer authentication',
    description: 'Optional hardware keys and adaptive MFA keep your desk safe from intrusions.',
  },
  {
    icon: ShieldAlert,
    title: '24/7 threat monitoring',
    description: 'Our team actively monitors for anomalies to keep scams and malicious actors out.',
  },
  {
    icon: HeartHandshake,
    title: 'Transparent performance',
    description: 'See real results, verified track records, and no hidden tactics or hard sells.',
  },
];

const cryptoPrices = [
  { symbol: 'BTC', name: 'Bitcoin', price: '115,782.93', change: '-0.77%', marketCap: '$2,306,777,649,371.17' },
  { symbol: 'ETH', name: 'Ethereum', price: '4,471.69', change: '-1.31%', marketCap: '$539,749,941,707.40' },
  { symbol: 'XRP', name: 'XRP', price: '3.00', change: '-1.11%', marketCap: '$179,492,030,212.14' },
  { symbol: 'SOL', name: 'Solana', price: '239.21', change: '-1.93%', marketCap: '$129,899,502,213.55' },
  { symbol: 'CRO', name: 'Cronos', price: '0.232679', change: '-0.34%', marketCap: '$8,100,649,111.74' },
];

export function LandingContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, value: number, date: string, time: string} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const { data: cryptoData, isLoading: isCryptoLoading } = useCryptoPrices();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 1000], [0, -200]);
  const featuresY = useTransform(scrollY, [0, 2000], [0, -100]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!menuOpen) {
      document.body.style.removeProperty('overflow');
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  // Process live crypto data for the chart
  const chartData = useMemo(() => {
    if (!cryptoData || cryptoData.length === 0) return [];
    
    const prices = cryptoData.map(item => item.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    return cryptoData.map((item, index) => {
      const normalizedPrice = ((item.close - minPrice) / priceRange) * 100 + 20; // Scale to 20-120 range
      const date = new Date(parseInt(item.t));
      return {
        x: (index / (cryptoData.length - 1)) * 260,
        y: 140 - normalizedPrice,
        value: item.close,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: item.t
      };
    });
  }, [cryptoData]);

  const heroSparklinePath = useMemo(
    () =>
      chartData.length > 1
        ? chartData
            .map((point) => `${point.x},${point.y}`)
            .join(' ')
        : '',
    [chartData]
  );

  const lastSparkX = chartData.length > 1 ? 260 : 0;
  const lastSparkY = chartData.length > 0 ? chartData[chartData.length - 1].y : 0;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-[#040918] text-white">
      {/* Fixed Header Container - Always Visible */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PromotionalBanner />
        <nav
          className={`border-b transition-all duration-300 ${
            isScrolled
              ? 'border-white/10 bg-[#030815]/95 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(5,119,218,0.6)]'
              : 'border-white/5 bg-[#040918]/80 backdrop-blur-sm'
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Logo size="lg" textClassName="gradient-text font-semibold" enableAnimations={true} asLink={true} href="/" />

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/70 transition-colors hover:text-white scroll-smooth"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0577DA]/20 transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
              >
                Join Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:text-white md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-white/10 bg-[#030915]/95 backdrop-blur-xl md:hidden">
              <div className="space-y-4 px-4 py-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block text-base font-medium text-white/80 transition hover:text-white scroll-smooth"
                  >
                    {link.label}
                  </a>
                ))}

                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="block rounded-full border border-white/15 px-5 py-2 text-center text-sm font-medium text-white/80 transition hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className="block rounded-full bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-5 py-2 text-center text-sm font-semibold text-white transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
                  >
                    Join Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10 flex-1 pt-44">
        <motion.section
          id="hero"
          className="relative overflow-hidden pt-8 pb-24 md:pt-12"
          style={{ y: heroY }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#071635] via-[#040918] to-[#02040B]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,153,250,0.3)_0%,transparent_60%)] opacity-50" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.18)_0%,transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                <Sparkles className="h-4 w-4 text-[#57c8ff]" />
                Live crypto signals reimagined
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Trade the moment
                <span className="block bg-gradient-to-r from-[#57c8ff] via-[#1199FA] to-[#6d5efc] bg-clip-text text-transparent">
                  clarity meets confidence
                </span>
              </h1>
              <p className="max-w-xl text-lg text-white/70 sm:text-xl">
                Zignal brings institutional-grade signals, guided strategy, and built-in risk controls together in one effortless workspace.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#0577DA]/20 transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#live-signals"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  <PlayCircle className="h-5 w-5 text-[#57c8ff]" />
                  Watch signal desk
                </a>
              </div>
              <ul className="grid gap-3 text-left sm:grid-cols-2">
                {heroChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur"
                  >
                    <div className="text-2xl font-semibold sm:text-3xl">{stat.value}</div>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
                    <p className="mt-1 text-sm text-white/60">{stat.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-[#0577DA]/40 via-[#1199FA]/30 to-[#6d5efc]/40 blur-3xl"
              />
              <div className="relative rounded-[28px] border border-white/15 bg-[#030716]/95 p-8 shadow-2xl shadow-[#021022]/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Signal workspace</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Pro momentum strategy</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                    Live
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/50">
                  {isCryptoLoading ? 'Loading live data...' : 'Last synced 2 minutes ago'}
                </p>
                <div 
                  className="mt-8 h-36 rounded-2xl border border-white/10 bg-white/[0.04] p-4 relative"
                  onMouseMove={(e) => {
                    if (!chartData || chartData.length === 0) return;
                    
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setMousePosition({ x: e.clientX, y: e.clientY });
                    
                    // Find the closest data point
                    const pointIndex = Math.round((x / rect.width) * (chartData.length - 1));
                    const clampedIndex = Math.max(0, Math.min(pointIndex, chartData.length - 1));
                    const point = chartData[clampedIndex];
                    setHoveredPoint({
                      x: point.x,
                      y: point.y,
                      value: point.value,
                      date: point.date,
                      time: point.time
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null);
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 260 140">
                    <defs>
                      <linearGradient id="heroLine" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#57c8ff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                      </linearGradient>
                      <pattern id="heroGrid" width="26" height="28" patternUnits="userSpaceOnUse">
                        <path d="M 26 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    
                    {/* Grid background */}
                    <rect width="260" height="140" fill="url(#heroGrid)" />
                    
                    {/* Horizontal grid lines */}
                    {[0, 28, 56, 84, 112, 140].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="260"
                        y2={y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="0.5"
                      />
                    ))}
                    
                    {/* Vertical grid lines */}
                    {[0, 52, 104, 156, 208, 260].map((x) => (
                      <line
                        key={x}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="140"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="0.5"
                      />
                    ))}
                    
                    {/* Chart line */}
                    {heroSparklinePath && (
                      <polyline
                        points={heroSparklinePath}
                        fill="none"
                        stroke="url(#heroLine)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Data points */}
                    {chartData.map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill="#34d399"
                        opacity="0.6"
                        className="hover:opacity-100 transition-opacity"
                      />
                    ))}
                    
                    {/* Last point highlight */}
                    {heroSparklinePath && <circle cx={lastSparkX} cy={lastSparkY} r="4" fill="#34d399" />}
                  </svg>
                  
                  {/* Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-10 rounded-lg bg-black/90 border border-white/20 px-3 py-2 text-xs text-white backdrop-blur-sm pointer-events-none"
                      style={{
                        left: `${Math.min(Math.max(mousePosition.x - 100, 10), 160)}px`,
                        top: `${Math.max(mousePosition.y - 100, 10)}px`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="font-semibold text-white">BTC/USDT</div>
                      <div className="text-white/80">${hoveredPoint.value.toLocaleString()}</div>
                      <div className="text-white/60">{hoveredPoint.date}</div>
                      <div className="text-white/60">{hoveredPoint.time}</div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">Running P&amp;L</p>
                    <p className="text-lg font-semibold text-emerald-300">+18.4%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50">Risk per trade</p>
                    <p className="text-lg font-semibold text-white">1.2%</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {heroPairs.map((item) => (
                    <div
                      key={item.pair}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{item.pair}</p>
                        <p className="text-xs text-white/50">
                          {item.direction} • Confidence {item.confidence}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          item.change.startsWith('-') ? 'text-red-400' : 'text-emerald-300'
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-6 py-3 text-sm font-semibold text-white transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
                >
                  Get live alerts
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="border-y border-white/5 bg-[#030a18]/80 py-8 backdrop-blur"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-sm text-white/50 md:flex-row md:justify-between">
            <span className="text-xs uppercase tracking-[0.4em] text-white/40">Trusted by teams at</span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-base font-semibold tracking-wide text-white/60 md:justify-end">
              <span>Zentrix Capital</span>
              <span>Atlas Quant</span>
              <span>Neon Hedge</span>
              <span>Vertex Labs</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          className="relative py-24"
          style={{ y: featuresY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040f25]/40 to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                <ShieldCheck className="h-4 w-4 text-[#57c8ff]" />
                Why traders stay
              </span>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Clarity at every market move</h2>
              <p className="mt-4 text-lg text-white/70">
                Actionable signals, human guidance, and automation working together so you can scale decisions without second-guessing.
              </p>
            </div>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
                ))}
              </div>
            }>
              <FeatureHighlights />
            </Suspense>
          </div>
        </motion.section>

        {/* Mission and Vision Section */}
        <motion.section
          id="mission"
          className="relative py-24 bg-gradient-to-b from-[#030a18]/60 via-[#040f25]/80 to-[#030a18]/60"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,225,218,0.08)_0%,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#33E1DA]/30 bg-[#33E1DA]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#33E1DA]">
                <Sparkles className="h-4 w-4" />
                Our Purpose
              </span>
              <h2 className="mt-6 text-4xl font-semibold sm:text-5xl">Driving your trading success</h2>
              <p className="mt-4 text-lg text-white/70">
                Built on clear values and a vision for the future of cryptocurrency trading
              </p>
            </div>
            
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Mission */}
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-[#33E1DA]/40 hover:bg-white/[0.06]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0577DA]/20 to-[#33E1DA]/20 border border-[#33E1DA]/30">
                    <ShieldCheck className="h-8 w-8 text-[#33E1DA]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Our Mission</h3>
                  <p className="text-white/80 leading-relaxed">
                    To guide every trader with clear and reliable cryptocurrency trading signals in order to make trading easier, straight to the point, and more profitable while building a supportive community that grows together.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-[#0577DA] to-[#33E1DA] rounded-full"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#33E1DA] font-semibold">Community First</span>
                  </div>
                </div>
              </div>
              
              {/* Vision */}
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-[#33E1DA]/40 hover:bg-white/[0.06]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1199FA]/20 to-[#6d5efc]/20 border border-[#1199FA]/30">
                    <Sparkles className="h-8 w-8 text-[#1199FA]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Our Vision</h3>
                  <p className="text-white/80 leading-relaxed">
                    To be the go-to crypto signals hub for everyone. We are data-driven, trustworthy, and innovative in the cryptocurrency space. We do this by paving the way for financial freedom for Zignal members.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-[#1199FA] to-[#6d5efc] rounded-full"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#1199FA] font-semibold">Financial Freedom</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="mx-auto max-w-2xl rounded-3xl border border-[#33E1DA]/20 bg-gradient-to-br from-[#0577DA]/10 via-[#33E1DA]/5 to-[#1199FA]/10 p-8 backdrop-blur">
                <h3 className="text-2xl font-semibold text-white mb-4">Ready to join our community?</h3>
                <p className="text-white/70 mb-6">
                  Experience the difference that clear signals and expert guidance can make in your trading journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#pricing"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#0577DA]/20 transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
                  >
                    View Packages
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#support"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    <HeartHandshake className="h-5 w-5 text-[#33E1DA]" />
                    Contact Advisor
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          className="relative overflow-hidden bg-[#030a18] py-24"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(17,153,250,0.35)_0%,transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mx-auto mb-10 max-w-xl text-center lg:text-left">
                <h2 className="text-4xl font-semibold sm:text-5xl">Convert, plan, and execute faster</h2>
                <p className="mt-4 text-lg text-white/70">
                  Streamline your entries with the built-in converter and see real-time package performance before you commit.
                </p>
              </div>
              <Suspense fallback={
                <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
              }>
                <PriceConverter />
              </Suspense>
            </div>
            <div className="space-y-8">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
                <h3 className="text-2xl font-semibold">Included with every plan</h3>
                <p className="mt-3 text-white/70">
                  From solo traders to quant teams, unlock tooling designed to scale with your strategy.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Unlimited live alerts across 400+ pairs
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Smart risk templates &amp; protective stops
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    1:1 onboarding with a senior strategist
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Portfolio-grade analytics in real time
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl border border-[#0577DA]/20 bg-[#01060f]/80 p-8">
                <h3 className="text-xl font-semibold text-[#57c8ff]">Need a custom desk?</h3>
                <p className="mt-3 text-sm text-white/70">
                  We build managed signal desks for funds, prop firms, and communities. Get white-glove support and tailored automation.
                </p>
                <a
                  href="#support"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  Talk to sales
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="relative mx-auto mt-16 max-w-7xl px-4">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-3xl font-semibold">Market overview</h3>
                <p className="mt-2 text-white/70">Stay on top of leading assets before the next alert fires.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover;border-white/25 hover:text-white">
                View full market board
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              {cryptoPrices.map((crypto) => (
                <AdvancedMiniChart 
                  key={crypto.symbol} 
                  {...crypto} 
                  isPositive={!crypto.change.startsWith('-')}
                />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="live-signals"
          className="relative overflow-hidden py-24"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#01060f] via-[#040c1d] to-[#010308]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,119,218,0.35)_0%,transparent_65%)] opacity-50" />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-4xl font-semibold sm:text-5xl">Advanced trading analysis</h2>
              <p className="mt-4 text-lg text-white/70">
                Track structure, momentum, and liquidity from a single interactive canvas built for actionable decisions.
              </p>
            </div>
            <Suspense fallback={
              <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse flex items-center justify-center">
                <div className="text-white/50">Loading chart...</div>
              </div>
            }>
              <OptimizedTradingChart />
            </Suspense>
          </div>
        </motion.section>

        <motion.section
          id="security"
          className="relative py-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#010308] via-[#061121] to-[#010308]" />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mb-14 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#33E1DA]/40 bg-[#33E1DA]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#33E1DA]">
                <ShieldCheck className="h-4 w-4" />
                Security first
              </span>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Your assets stay protected</h2>
              <p className="mt-4 text-lg text-white/70">
                Enterprise-grade security, transparent governance, and human oversight so you can scale with confidence.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {securityHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover;border-[#33E1DA]/60 hover:bg-white/[0.08]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#33E1DA]/10 text-[#33E1DA] group-hover:bg-[#33E1DA]/20">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:flex-row md;text-left">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/45">Compliance ready</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  SOC2 roadmap, GDPR compliant, SSL encrypted
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70">
                  Bank-level encryption
                </span>
                <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70">
                  Optional hardware MFA
                </span>
                <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70">
                  Real-time audits
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Customer Service Section */}
        <motion.section
          id="customer-service"
          className="relative py-24 bg-gradient-to-b from-[#010308] via-[#040f25] to-[#010308]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,225,218,0.12)_0%,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#33E1DA]/30 bg-[#33E1DA]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#33E1DA]">
                <HeartHandshake className="h-4 w-4" />
                Real Human Support
              </span>
              <h2 className="mt-6 text-4xl font-semibold sm:text-5xl">Always here when you need us</h2>
              <p className="mt-4 text-lg text-white/70">
                Our Zignals customer service representatives (not AI bots) are available 24/7 for account questions, live trade checks, and onboarding help.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* 24/7 Support */}
              <div className="relative group">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-[#33E1DA]/40 hover:bg-white/[0.06]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#33E1DA]/20 to-[#0577DA]/20 border border-[#33E1DA]/30">
                    <MessageCircle className="h-8 w-8 text-[#33E1DA]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">24/7 Live Support</h3>
                  <p className="text-white/80 leading-relaxed">
                    Connect instantly with our experienced trading support team. No waiting, no bots—just real people who understand your trading needs.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                    <span className="text-sm text-emerald-400 font-semibold">Online Now</span>
                  </div>
                </div>
              </div>

              {/* Account Questions */}
              <div className="relative group">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-[#33E1DA]/40 hover:bg-white/[0.06]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1199FA]/20 to-[#0577DA]/20 border border-[#1199FA]/30">
                    <LifeBuoy className="h-8 w-8 text-[#1199FA]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Account Assistance</h3>
                  <p className="text-white/80 leading-relaxed">
                    Get help with deposits, withdrawals, account verification, security settings, and platform navigation from our dedicated team.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-[#1199FA] to-[#0577DA] rounded-full"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#1199FA] font-semibold">Expert Help</span>
                  </div>
                </div>
              </div>

              {/* Onboarding Help */}
              <div className="relative group">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-[#33E1DA]/40 hover:bg-white/[0.06]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6d5efc]/20 to-[#1199FA]/20 border border-[#6d5efc]/30">
                    <Sparkles className="h-8 w-8 text-[#6d5efc]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Onboarding Support</h3>
                  <p className="text-white/80 leading-relaxed">
                    Personal guidance to get you started with signals, strategy setup, risk management, and making your first successful trades.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-[#6d5efc] to-[#1199FA] rounded-full"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#6d5efc] font-semibold">Personal Guide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-16 text-center">
              <div className="mx-auto max-w-2xl rounded-3xl border border-[#33E1DA]/20 bg-gradient-to-br from-[#0577DA]/10 via-[#33E1DA]/5 to-[#1199FA]/10 p-8 backdrop-blur">
                <h3 className="text-2xl font-semibold text-white mb-4">Need help right now?</h3>
                <p className="text-white/70 mb-6">
                  Our support team is standing by to assist you with any questions about our platform, signals, or trading strategies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@zignals.org"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#0577DA]/20 transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Contact Support
                  </a>
                  <a
                    href="#support"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    <LifeBuoy className="h-5 w-5 text-[#33E1DA]" />
                    Browse FAQ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="support"
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Suspense fallback={
            <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur animate-pulse"></div>
          }>
            <FAQSection />
          </Suspense>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 bg-[#02060f]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="md" textClassName="font-semibold text-white" enableAnimations={true} asLink={true} href="/" />
            <p className="mt-4 text-sm text-white/60">
              Professional-grade crypto signals, actionable insights, and automation built for fast-moving teams.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-white/40">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Infrastructure status: <span className="font-semibold text-white/70">Operational</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-white font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="transition hover:text-white">Live Signals</a></li>
              <li><a href="#pricing" className="transition hover:text-white">Pricing</a></li>
              <li><a href="#live-signals" className="transition hover:text-white">Analytics Suite</a></li>
              <li><a href="#security" className="transition hover:text-white">Security</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-white font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#support" className="transition hover:text-white">Help Center</a></li>
              <li><a href="#support" className="transition hover:text-white">Contact</a></li>
              <li><a href="#" className="transition hover:text-white">Careers</a></li>
              <li><a href="#" className="transition hover:text-white">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-white font-semibold">Stay updated</h3>
            <p className="text-sm text-white/60">
              Join thousands of traders who receive weekly strategy notes.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="you@firm.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#0577DA] focus:outline-none"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#0a8ae8] hover:to-[#22a9ff]"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-white/40">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/40 md:flex-row">
            <p>© {new Date().getFullYear()} Zignal. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="transition hover:text-white/70">Privacy Policy</a>
              <a href="#" className="transition hover:text-white/70">Terms of Service</a>
              <a href="#" className="transition hover:text-white/70">Legal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
