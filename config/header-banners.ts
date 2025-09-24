import { TrendingUp, Activity, DollarSign, Users, Signal, Star } from 'lucide-react';

export interface HeaderBanner {
  id: number;
  icon: any;
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const HEADER_BANNERS: HeaderBanner[] = [
  {
    id: 1,
    icon: TrendingUp,
    text: "BTC/USD: +5.2% | Live Trading Signal Active",
    color: "text-green-300", // Improved contrast
    bgColor: "bg-green-500/15", // Increased opacity
    borderColor: "border-green-500/30" // Increased opacity
  },
  {
    id: 2,
    icon: Activity,
    text: "15 Active Trades | Average ROI: +12.8%",
    color: "text-blue-300", // Improved contrast
    bgColor: "bg-blue-500/15", // Increased opacity
    borderColor: "border-blue-500/30" // Increased opacity
  },
  {
    id: 3,
    icon: DollarSign,
    text: "Portfolio Value: $24,567 | Daily Gain: +3.4%",
    color: "text-yellow-300", // Improved contrast
    bgColor: "bg-yellow-500/15", // Increased opacity
    borderColor: "border-yellow-500/30" // Increased opacity
  },
  {
    id: 4,
    icon: Users,
    text: "1,247 Active Traders | Join Premium Signals",
    color: "text-purple-300", // Improved contrast
    bgColor: "bg-purple-500/15", // Increased opacity
    borderColor: "border-purple-500/30" // Increased opacity
  },
  {
    id: 5,
    icon: Signal,
    text: "ETH/USD Signal: Strong Buy | Entry: $3,250",
    color: "text-emerald-300", // Improved contrast
    bgColor: "bg-emerald-500/15", // Increased opacity
    borderColor: "border-emerald-500/30" // Increased opacity
  },
  {
    id: 6,
    icon: Star,
    text: "Premium Package: 50% OFF | Limited Time Offer",
    color: "text-orange-300", // Improved contrast
    bgColor: "bg-orange-500/15", // Increased opacity
    borderColor: "border-orange-500/30" // Increased opacity
  }
];
