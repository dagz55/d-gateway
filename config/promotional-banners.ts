import { TrendingUp, Package, Users, ChevronRight, Bitcoin, BarChart3, DollarSign, Zap } from 'lucide-react';

export interface PromotionalBanner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  icon: any;
  gradient: string;
  accent: string;
  cryptoSymbol: string;
  animationType: 'float' | 'glow' | 'pulse';
  stats?: {
    value: string;
    label: string;
  };
}

export const DEFAULT_PROMO_BANNERS: PromotionalBanner[] = [
  {
    id: 1,
    title: "🚀 CRYPTO SIGNALS LIVE NOW!",
    subtitle: "₿ BTC/ETH Signals • 95% Win Rate • Real-Time Alerts ₿",
    cta: "⚡ GET PREMIUM SIGNALS NOW - LIMITED TIME! ⚡",
    icon: Bitcoin,
    gradient: "from-[#f7931a] via-[#33E1DA] to-[#22c55e]",
    accent: "#f7931a",
    cryptoSymbol: "₿",
    animationType: 'float',
    stats: {
      value: "95%",
      label: "Win Rate"
    }
  },
  {
    id: 2,
    title: "📈 PREMIUM PACKAGES AVAILABLE",
    subtitle: "💎 Pro Trading Plans • Exclusive Signals • VIP Support 💎",
    cta: "🔥 UPGRADE NOW - SPECIAL OFFER! 🔥",
    icon: Package,
    gradient: "from-[#8b5cf6] via-[#33E1DA] to-[#f59e0b]",
    accent: "#8b5cf6",
    cryptoSymbol: "💎",
    animationType: 'glow',
    stats: {
      value: "24/7",
      label: "Support"
    }
  },
  {
    id: 3,
    title: "👥 10,000+ ACTIVE TRADERS",
    subtitle: "🌟 Join Our Community • Share Strategies • Win Together 🌟",
    cta: "🚀 JOIN THE WINNING TEAM! 🚀",
    icon: Users,
    gradient: "from-[#06b6d4] via-[#33E1DA] to-[#10b981]",
    accent: "#06b6d4",
    cryptoSymbol: "🌟",
    animationType: 'pulse',
    stats: {
      value: "10K+",
      label: "Traders"
    }
  },
  {
    id: 4,
    title: "📊 LIVE MARKET ANALYSIS",
    subtitle: "⚡ Real-Time Data • AI Predictions • Smart Alerts ⚡",
    cta: "🎯 START TRADING SMART TODAY! 🎯",
    icon: BarChart3,
    gradient: "from-[#ef4444] via-[#33E1DA] to-[#3b82f6]",
    accent: "#ef4444",
    cryptoSymbol: "⚡",
    animationType: 'float',
    stats: {
      value: "Real-Time",
      label: "Updates"
    }
  },
  {
    id: 5,
    title: "💰 MAXIMIZE YOUR PROFITS",
    subtitle: "💸 Advanced Strategies • Risk Management • Profit Tracking 💸",
    cta: "💎 UNLOCK PROFIT POTENTIAL! 💎",
    icon: DollarSign,
    gradient: "from-[#10b981] via-[#33E1DA] to-[#f59e0b]",
    accent: "#10b981",
    cryptoSymbol: "💸",
    animationType: 'glow',
    stats: {
      value: "+150%",
      label: "Avg ROI"
    }
  },
  {
    id: 6,
    title: "⚡ LIGHTNING FAST EXECUTION",
    subtitle: "🚀 Instant Signals • Auto-Trading • Zero Delays 🚀",
    cta: "⚡ EXPERIENCE SPEED TRADING! ⚡",
    icon: Zap,
    gradient: "from-[#f59e0b] via-[#33E1DA] to-[#8b5cf6]",
    accent: "#f59e0b",
    cryptoSymbol: "🚀",
    animationType: 'pulse',
    stats: {
      value: "<1s",
      label: "Latency"
    }
  }
];
