'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  Shield,
  Target,
  Zap,
  Crown,
  Lock,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Eye,
  Bell,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureTeaserProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  features: string[];
  isPopular?: boolean;
  delay?: number;
}

const FeatureTeaser = ({
  title,
  description,
  icon: Icon,
  gradient,
  features,
  isPopular = false,
  delay = 0
}: FeatureTeaserProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <Card className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
        gradient,
        isPopular && "ring-2 ring-yellow-400/50"
      )}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              MOST POPULAR
            </Badge>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </motion.div>

        <CardContent className="relative z-10 p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Icon className="h-8 w-8" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-white/80 mt-2">{description}</p>
              </div>
            </div>
            <Lock className="h-5 w-5 text-white/60" />
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.1 * index }}
              >
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-white/90">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 group"
              size="lg"
            >
              <span className="mr-2">Unlock Premium Features</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.5 }}
            >
              <p className="text-xs text-white/60">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Join 50,000+ professional traders
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function PremiumFeatureTeasers() {
  const features = [
    {
      title: "Live Trading Signals",
      description: "Real-time buy/sell signals from our AI algorithms",
      icon: TrendingUp,
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      features: [
        "Real-time signal alerts via SMS & email",
        "95% accuracy rate with institutional data",
        "Entry & exit points with risk management",
        "24/7 market coverage across all assets"
      ],
      isPopular: true
    },
    {
      title: "Professional Charts",
      description: "Advanced technical analysis with institutional tools",
      icon: BarChart3,
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      features: [
        "Level 2 market data & order flow",
        "Advanced indicators & custom studies",
        "Multi-timeframe analysis tools",
        "Professional charting interface"
      ]
    },
    {
      title: "Risk Management",
      description: "Automated portfolio protection and optimization",
      icon: Shield,
      gradient: "from-orange-600 via-red-600 to-pink-600",
      features: [
        "Automated stop-loss & take-profit",
        "Position sizing optimization",
        "Portfolio risk analytics",
        "Real-time drawdown protection"
      ]
    },
    {
      title: "Portfolio Insights",
      description: "Deep analytics and performance tracking",
      icon: Target,
      gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
      features: [
        "Performance attribution analysis",
        "Tax-loss harvesting suggestions",
        "Diversification optimization",
        "Professional reporting tools"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border-yellow-400/30">
            <Crown className="h-3 w-3 mr-1" />
            PREMIUM FEATURES
          </Badge>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
          Unlock Professional Trading Tools
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of professional traders who rely on our institutional-grade platform for consistent profits.
          Upgrade now to access advanced features and maximize your trading potential.
        </p>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <FeatureTeaser
            key={feature.title}
            {...feature}
            delay={index * 0.2}
          />
        ))}
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative"
      >
        <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-sm text-white/70 ml-2">4.9/5 from 12,000+ traders</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Trade Like a Pro?
            </h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Start your 7-day free trial and experience the difference professional tools make.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 shadow-lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-white/50">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                14-day money back
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}