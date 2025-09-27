"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Clock, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompactTradingChart } from "@/components/trading/CompactTradingChart";
import { cn } from "@/lib/utils";

interface TradingSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  className?: string;
}

interface QuickSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  change: number;
  confidence: number;
  timeframe: string;
}

// Mock trading signals data
const mockSignals: QuickSignal[] = [
  {
    id: '1',
    symbol: 'BTC/USD',
    type: 'buy',
    price: 45250,
    change: 2.4,
    confidence: 85,
    timeframe: '4h'
  },
  {
    id: '2',
    symbol: 'ETH/USD',
    type: 'sell',
    price: 2850,
    change: -1.2,
    confidence: 72,
    timeframe: '1h'
  },
  {
    id: '3',
    symbol: 'SOL/USD',
    type: 'buy',
    price: 125,
    change: 5.8,
    confidence: 90,
    timeframe: '1d'
  }
];

const QuickSignalCard: React.FC<{ signal: QuickSignal }> = ({ signal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg bg-gradient-to-r from-[#1e2a44]/40 to-[#0a0f1f]/40 border border-[#33e1da]/10 hover:border-[#33e1da]/30 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={signal.type === 'buy' ? 'default' : 'destructive'}
            className={cn(
              "text-[10px] font-bold px-2 py-0.5",
              signal.type === 'buy'
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            )}
          >
            {signal.type === 'buy' ? <TrendingUp className="w-2 h-2 mr-1" /> : <TrendingDown className="w-2 h-2 mr-1" />}
            {signal.type.toUpperCase()}
          </Badge>
          <span className="text-xs font-medium text-[#eaf2ff]/80">{signal.symbol}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#eaf2ff]/60" />
          <span className="text-[10px] text-[#eaf2ff]/60">{signal.timeframe}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-[#eaf2ff]">
            ${signal.price.toLocaleString()}
          </div>
          <div className={cn(
            "text-[10px] font-medium",
            signal.change >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {signal.change >= 0 ? "+" : ""}{signal.change.toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-2 h-2 text-[#33e1da]" />
            <span className="text-[10px] text-[#eaf2ff]/60">Confidence</span>
          </div>
          <div className="text-xs font-bold text-[#33e1da]">{signal.confidence}%</div>
        </div>
      </div>
    </motion.div>
  );
};

const MarketOverview: React.FC = () => {
  const marketData = [
    { name: 'Fear & Greed', value: 42, label: 'Fear', color: 'text-red-400' },
    { name: 'Market Cap', value: '$2.1T', label: '+2.4%', color: 'text-green-400' },
    { name: 'Dominance', value: '52.1%', label: 'BTC', color: 'text-[#33e1da]' }
  ];

  return (
    <Card className="bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-[#eaf2ff] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#33e1da]" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {marketData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs text-[#eaf2ff]/60">{item.name}</span>
            <div className="text-right">
              <div className="text-sm font-bold text-[#eaf2ff]">{item.value}</div>
              <div className={cn("text-[10px] font-medium", item.color)}>{item.label}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const TradingSidePanel: React.FC<TradingSidePanelProps> = ({
  isOpen,
  onClose,
  onToggle,
  className
}) => {
  const [expandedChart, setExpandedChart] = useState(false);

  const handleExpandChart = () => {
    setExpandedChart(true);
    // This would typically open a modal or navigate to the full chart page
    // For now, we'll just show an alert
    setTimeout(() => {
      setExpandedChart(false);
    }, 2000);
  };

  return (
    <>
      {/* Toggle Button - Always visible when panel is closed */}
      {!isOpen && (
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
        >
          <Button
            variant="default"
            size="sm"
            onClick={onToggle}
            className="rounded-l-lg rounded-r-none h-12 w-6 p-0 bg-gradient-to-b from-[#33e1da] to-[#1e7fb8] hover:from-[#33e1da]/90 hover:to-[#1e7fb8]/90 border-r-0 shadow-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full z-40 glass border-l border-border",
                "w-80 md:w-96", // Responsive width
                "flex flex-col",
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#33e1da]" />
                  <h2 className="text-lg font-bold text-[#eaf2ff]">Trading Hub</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-8 w-8 p-0 hover:bg-accent/20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-accent/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Compact Trading Chart */}
                <div className="relative">
                  <CompactTradingChart
                    onExpand={handleExpandChart}
                    isExpandable={true}
                  />
                  {expandedChart && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#33e1da]/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
                    >
                      <div className="text-center text-[#eaf2ff]">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-medium">Opening Full Chart...</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Market Overview */}
                <MarketOverview />

                {/* Quick Signals */}
                <Card className="bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#eaf2ff] flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#33e1da]" />
                      Quick Signals
                      <Badge className="ml-auto text-[10px] bg-[#33e1da]/20 text-[#33e1da]">
                        {mockSignals.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockSignals.map((signal, index) => (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <QuickSignalCard signal={signal} />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#eaf2ff]">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Place Buy Order
                    </Button>
                    <Button variant="destructive" className="w-full">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Place Sell Order
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Set Price Alert
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};