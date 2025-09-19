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
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: 2,
    icon: Activity,
    text: "15 Active Trades | Average ROI: +12.8%",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: 3,
    icon: DollarSign,
    text: "Portfolio Value: $24,567 | Daily Gain: +3.4%",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  {
    id: 4,
    icon: Users,
    text: "1,247 Active Traders | Join Premium Signals",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: 5,
    icon: Signal,
    text: "ETH/USD Signal: Strong Buy | Entry: $3,250",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    id: 6,
    icon: Star,
    text: "Premium Package: 50% OFF | Limited Time Offer",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  }
];
