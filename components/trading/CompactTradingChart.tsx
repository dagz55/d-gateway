"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Minimize2, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

interface CompactTooltipData extends CandlestickData {
  indicators: TechnicalIndicators;
}

// Reuse the same mock data generation and calculation functions from AdvancedTradingChart
const generateMockData = (timeframe: string, count: number = 50): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let basePrice = 45000 + Math.random() * 10000;
  const now = Date.now();

  const timeMultiplier = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000
  }[timeframe] || 3600000;

  for (let i = count; i >= 0; i--) {
    const volatility = 0.02;
    const trend = Math.sin(i * 0.1) * 0.005;
    const randomChange = (Math.random() - 0.5) * volatility;

    const open = basePrice;
    const change = basePrice * (trend + randomChange);
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = 1000000 + Math.random() * 5000000;

    data.push({
      timestamp: now - (i * timeMultiplier),
      open,
      high,
      low,
      close,
      volume
    });

    basePrice = close;
  }

  return data.reverse();
};

const calculateTechnicalIndicators = (data: CandlestickData[], index: number): TechnicalIndicators => {
  const prices = data.slice(Math.max(0, index - 20), index + 1).map(d => d.close);
  const current = data[index];

  // Simple RSI calculation
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  // Simple moving averages
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length);

  // Bollinger Bands
  const stdDev = Math.sqrt(prices.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / Math.min(20, prices.length));

  return {
    rsi: Math.max(0, Math.min(100, rsi)),
    macd: (sma20 - sma50) / current.close * 100,
    sma20,
    sma50,
    bollinger: {
      upper: sma20 + (stdDev * 2),
      middle: sma20,
      lower: sma20 - (stdDev * 2)
    }
  };
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatCompactPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  return `$${price.toFixed(0)}`;
};

const CompactCandlestickChart: React.FC<{
  data: CandlestickData[];
  width: number;
  height: number;
  onHover: (data: CompactTooltipData | null) => void;
}> = ({ data, width, height, onHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const padding = { top: 10, right: 5, bottom: 10, left: 5 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const priceRange = useMemo(() => {
    const allPrices = data.flatMap(d => [d.high, d.low]);
    return {
      min: Math.min(...allPrices) * 0.998,
      max: Math.max(...allPrices) * 1.002
    };
  }, [data]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    const priceToY = (price: number) =>
      padding.top + chartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;

    const indexToX = (index: number) =>
      padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;

    // Draw subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(26, 127, 179, 0.05)');
    gradient.addColorStop(1, 'rgba(10, 15, 31, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw compact candlesticks
    const candleWidth = Math.max(1, chartWidth / data.length * 0.7);

    data.forEach((candle, index) => {
      const x = indexToX(index);
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isGreen = candle.close > candle.open;
      const baseColor = isGreen ? '#10b981' : '#ef4444';
      const alpha = hoveredIndex === index ? 1 : 0.7;

      // Draw wick
      ctx.strokeStyle = `${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);

      ctx.fillStyle = `${baseColor}${Math.floor(alpha * (isGreen ? 0.6 : 0.8) * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, Math.max(1, bodyHeight));
    });

    // Draw simple SMA line if we have enough data
    if (data.length > 10) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      data.forEach((_, index) => {
        if (index >= 9) {
          const indicators = calculateTechnicalIndicators(data, index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma20);

          if (index === 9) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }
  }, [data, width, height, priceRange, hoveredIndex, chartWidth, chartHeight]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= padding.left && x <= width - padding.right &&
        y >= padding.top && y <= height - padding.bottom) {

      const dataIndex = Math.round(((x - padding.left) / chartWidth) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, dataIndex));

      setHoveredIndex(clampedIndex);

      const candle = data[clampedIndex];
      const indicators = calculateTechnicalIndicators(data, clampedIndex);

      const tooltipData: CompactTooltipData = {
        ...candle,
        indicators
      };

      onHover(tooltipData);
    } else {
      setHoveredIndex(null);
      onHover(null);
    }
  }, [data, width, height, chartWidth, padding, onHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    onHover(null);
  }, [onHover]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair rounded-md"
      style={{ background: 'transparent' }}
    />
  );
};

const CompactTooltip: React.FC<{
  data: CompactTooltipData | null;
  visible: boolean;
}> = ({ data, visible }) => {
  if (!visible || !data) return null;

  const change = data.close - data.open;
  const changePercent = (change / data.open) * 100;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute top-2 left-2 right-2 z-10 pointer-events-none"
    >
      <div className="bg-gradient-to-r from-[#1e2a44]/95 to-[#0a0f1f]/95 backdrop-blur-sm border border-[#33e1da]/20 rounded-lg p-2 text-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#eaf2ff]">{formatPrice(data.close)}</span>
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className={cn(
                "text-[10px] font-bold px-1 py-0",
                isPositive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="text-[#eaf2ff]/60">RSI: <span className="text-[#eaf2ff] font-medium">{data.indicators.rsi.toFixed(0)}</span></div>
          <div className="text-[#eaf2ff]/60">Vol: <span className="text-[#33e1da] font-medium">{(data.volume / 1e6).toFixed(1)}M</span></div>
        </div>
      </div>
    </motion.div>
  );
};

interface CompactTradingChartProps {
  className?: string;
  onExpand?: () => void;
  isExpandable?: boolean;
}

export const CompactTradingChart: React.FC<CompactTradingChartProps> = ({
  className,
  onExpand,
  isExpandable = true
}) => {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipData, setTooltipData] = useState<CompactTooltipData | null>(null);
  const [isLive, setIsLive] = useState(true);

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const loadData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newData = generateMockData(timeframe, 30); // Fewer candles for compact view
      setData(newData);
      setIsLoading(false);
    }, 150);
  }, [timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(prevData => {
        if (prevData.length === 0) return prevData;

        const lastCandle = { ...prevData[prevData.length - 1] };
        const volatility = 0.001;
        const change = lastCandle.close * (Math.random() - 0.5) * volatility;
        const newClose = lastCandle.close + change;

        const updatedCandle = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          volume: lastCandle.volume + Math.random() * 50000,
          timestamp: Date.now()
        };

        return [...prevData.slice(0, -1), updatedCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleTooltipHover = useCallback((data: CompactTooltipData | null) => {
    setTooltipData(data);
  }, []);

  return (
    <Card className={cn("overflow-hidden bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/60 backdrop-blur-sm border-[#33e1da]/20", className)}>
      {/* Compact Header */}
      <CardHeader className="pb-2 px-3 py-2 border-b border-[#33e1da]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#eaf2ff] flex items-center gap-2">
                BTC/USD
                {isLive && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-green-400 font-medium uppercase tracking-wider">LIVE</span>
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eaf2ff]">{formatCompactPrice(currentPrice)}</span>
                <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="text-[9px] font-bold px-1 py-0">
                  {priceChange >= 0 ? <TrendingUp className="w-2 h-2 mr-0.5" /> : <TrendingDown className="w-2 h-2 mr-0.5" />}
                  {Math.abs(priceChangePercent).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-12 h-6 text-[9px] bg-[#1e2a44]/60 border-[#33e1da]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2a44]/95 border-[#33e1da]/30">
                <SelectItem value="1m" className="text-xs">1m</SelectItem>
                <SelectItem value="5m" className="text-xs">5m</SelectItem>
                <SelectItem value="1h" className="text-xs">1h</SelectItem>
                <SelectItem value="4h" className="text-xs">4h</SelectItem>
                <SelectItem value="1d" className="text-xs">1d</SelectItem>
              </SelectContent>
            </Select>

            {isExpandable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent/20"
                onClick={onExpand}
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Compact Chart */}
      <CardContent className="p-2">
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <motion.div
                className="w-6 h-6 border-2 border-[#33e1da]/30 border-t-[#33e1da] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="relative">
              <CompactCandlestickChart
                data={data}
                width={280}
                height={160}
                onHover={handleTooltipHover}
              />

              <AnimatePresence>
                <CompactTooltip
                  data={tooltipData}
                  visible={!!tooltipData}
                />
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>

      {/* Quick Actions */}
      <div className="flex gap-1 p-2 pt-0">
        <Button size="sm" className="flex-1 h-6 text-[9px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
          <TrendingUp className="w-2 h-2 mr-1" />
          BUY
        </Button>
        <Button size="sm" variant="destructive" className="flex-1 h-6 text-[9px]">
          <TrendingDown className="w-2 h-2 mr-1" />
          SELL
        </Button>
        <Button size="sm" variant="outline" className="flex-1 h-6 text-[9px]">
          <BarChart3 className="w-2 h-2 mr-1" />
          VIEW
        </Button>
      </div>
    </Card>
  );
};