"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, LineChart, AreaChart, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface SupportResistance {
  support: number[];
  resistance: number[];
}

interface TooltipData extends CandlestickData {
  indicators: TechnicalIndicators;
  supportResistance: SupportResistance;
}

const generateMockData = (timeframe: string, count: number = 100): CandlestickData[] => {
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
  const prices = data.slice(Math.max(0, index - 50), index + 1).map(d => d.close);
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

const calculateSupportResistance = (data: CandlestickData[]): SupportResistance => {
  const highs = data.map(d => d.high).sort((a, b) => b - a);
  const lows = data.map(d => d.low).sort((a, b) => a - b);
  
  return {
    resistance: highs.slice(0, 3),
    support: lows.slice(0, 3)
  };
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toString();
};

const CandlestickChart: React.FC<{
  data: CandlestickData[];
  width: number;
  height: number;
  onHover: (data: TooltipData | null, x: number, y: number) => void;
}> = ({ data, width, height, onHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animationRef = useRef<number>(undefined);

  const padding = { top: 20, right: 60, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const priceRange = useMemo(() => {
    const allPrices = data.flatMap(d => [d.high, d.low]);
    return {
      min: Math.min(...allPrices) * 0.995,
      max: Math.max(...allPrices) * 1.005
    };
  }, [data]);

  const supportResistance = useMemo(() => calculateSupportResistance(data), [data]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI support for crisp rendering
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
      padding.left + (index / (data.length - 1)) * chartWidth;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(26, 127, 179, 0.1)');
    gradient.addColorStop(1, 'rgba(10, 15, 31, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw animated grid
    ctx.strokeStyle = 'rgba(51, 225, 218, 0.15)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines with glow effect
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.shadowColor = 'rgba(51, 225, 218, 0.3)';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Enhanced price labels with background
      const price = priceRange.max - (i / 5) * (priceRange.max - priceRange.min);
      ctx.fillStyle = 'rgba(10, 15, 31, 0.8)';
      ctx.fillRect(padding.left - 80, y - 10, 70, 20);
      ctx.fillStyle = 'rgba(234, 242, 255, 0.9)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatPrice(price), padding.left - 15, y + 4);
    }

    // Draw support/resistance levels with enhanced styling
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    [...supportResistance.support, ...supportResistance.resistance].forEach((level, index) => {
      const y = priceToY(level);
      const isSupport = index < supportResistance.support.length;
      
      ctx.strokeStyle = isSupport ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
      ctx.shadowColor = isSupport ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.shadowBlur = 4;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Level labels
      ctx.fillStyle = isSupport ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isSupport ? 'S' : 'R', width - padding.right + 5, y + 3);
    });
    
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Draw candlesticks with enhanced styling
    const candleWidth = Math.max(3, chartWidth / data.length * 0.8);
    
    data.forEach((candle, index) => {
      const x = indexToX(index);
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      
      const isGreen = candle.close > candle.open;
      const baseColor = isGreen ? '#10b981' : '#ef4444';
      const alpha = hoveredIndex === index ? 1 : 0.85;
      const glowIntensity = hoveredIndex === index ? 0.6 : 0.2;
      
      // Add glow effect for hovered candle
      if (hoveredIndex === index) {
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 8;
      }
      
      // Draw wick with gradient
      const wickGradient = ctx.createLinearGradient(x, highY, x, lowY);
      wickGradient.addColorStop(0, `${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      wickGradient.addColorStop(1, `${baseColor}${Math.floor(alpha * 0.6 * 255).toString(16).padStart(2, '0')}`);
      
      ctx.strokeStyle = wickGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Draw body with gradient
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      const bodyGradient = ctx.createLinearGradient(x, bodyY, x, bodyY + bodyHeight);
      if (isGreen) {
        bodyGradient.addColorStop(0, `rgba(16, 185, 129, ${alpha * 0.4})`);
        bodyGradient.addColorStop(1, `rgba(16, 185, 129, ${alpha * 0.8})`);
      } else {
        bodyGradient.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.8})`);
        bodyGradient.addColorStop(1, `rgba(239, 68, 68, ${alpha * 0.6})`);
      }
      
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 2);
      
      // Border
      ctx.strokeStyle = `${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 2);
      
      ctx.shadowBlur = 0;
    });

    // Draw technical indicators with smooth curves
    if (data.length > 20) {
      // SMA20 line
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      
      data.forEach((_, index) => {
        if (index >= 19) {
          const indicators = calculateTechnicalIndicators(data, index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma20);
          
          if (index === 19) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // SMA50 line
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      
      data.forEach((_, index) => {
        if (index >= 49) {
          const indicators = calculateTechnicalIndicators(data, index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma50);
          
          if (index === 49) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Enhanced time labels with background
    const labelCount = 6;
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const x = indexToX(index);
      const date = new Date(data[index].timestamp);
      
      ctx.fillStyle = 'rgba(10, 15, 31, 0.8)';
      ctx.fillRect(x - 25, height - 25, 50, 20);
      ctx.fillStyle = 'rgba(234, 242, 255, 0.9)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        x,
        height - 12
      );
    }
  }, [data, width, height, priceRange, hoveredIndex, supportResistance, chartWidth, chartHeight]);

  useEffect(() => {
    const animate = () => {
      drawChart();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawChart]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      
      const tooltipData: TooltipData = {
        ...candle,
        indicators,
        supportResistance
      };
      
      onHover(tooltipData, e.clientX, e.clientY);
    } else {
      setHoveredIndex(null);
      onHover(null, 0, 0);
    }
  }, [data, width, height, chartWidth, padding, onHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    onHover(null, 0, 0);
  }, [onHover]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair rounded-lg"
      style={{ background: 'transparent' }}
    />
  );
};

const AdvancedTooltip: React.FC<{
  data: TooltipData | null;
  x: number;
  y: number;
  visible: boolean;
}> = ({ data, x, y, visible }) => {
  if (!visible || !data) return null;

  const change = data.close - data.open;
  const changePercent = (change / data.open) * 100;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: Math.min(x + 15, window.innerWidth - 320),
        top: Math.max(y - 250, 10)
      }}
    >
      <div className="bg-gradient-to-br from-[#1e2a44]/95 to-[#0a0f1f]/95 backdrop-blur-xl border border-[#33e1da]/20 rounded-xl shadow-2xl p-5 min-w-[320px] max-w-[350px]">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#33e1da]/10 pb-3">
            <div className="text-sm font-medium text-[#eaf2ff]/70">
              {new Date(data.timestamp).toLocaleString()}
            </div>
            <Badge 
              variant={isPositive ? "default" : "destructive"} 
              className={cn(
                "text-xs font-bold",
                isPositive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>

          {/* OHLCV */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">Open:</span>
                <span className="font-mono text-[#eaf2ff] font-semibold">{formatPrice(data.open)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">High:</span>
                <span className="font-mono text-green-400 font-semibold">{formatPrice(data.high)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">Low:</span>
                <span className="font-mono text-red-400 font-semibold">{formatPrice(data.low)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">Close:</span>
                <span className={cn(
                  "font-mono font-semibold",
                  isPositive ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatPrice(data.close)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">Volume:</span>
                <span className="font-mono text-[#33e1da] font-semibold">{formatVolume(data.volume)}</span>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="border-t border-[#33e1da]/10 pt-3">
            <div className="text-xs font-semibold text-[#33e1da] mb-3 uppercase tracking-wide">Technical Indicators</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">RSI:</span>
                <span className={cn(
                  "font-mono font-bold",
                  data.indicators.rsi > 70 ? 'text-red-400' : 
                  data.indicators.rsi < 30 ? 'text-green-400' : 'text-[#eaf2ff]'
                )}>
                  {data.indicators.rsi.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">MACD:</span>
                <span className={cn(
                  "font-mono font-bold",
                  data.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {data.indicators.macd.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">SMA20:</span>
                <span className="font-mono text-blue-400 font-semibold text-xs">{formatPrice(data.indicators.sma20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">SMA50:</span>
                <span className="font-mono text-purple-400 font-semibold text-xs">{formatPrice(data.indicators.sma50)}</span>
              </div>
            </div>
          </div>

          {/* Support/Resistance */}
          <div className="border-t border-[#33e1da]/10 pt-3">
            <div className="text-xs font-semibold text-[#33e1da] mb-3 uppercase tracking-wide">Support & Resistance</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[#eaf2ff]/60 mb-2 font-medium">Resistance:</div>
                {data.supportResistance.resistance.slice(0, 2).map((level, i) => (
                  <div key={i} className="font-mono text-red-400 font-semibold mb-1">
                    {formatPrice(level)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[#eaf2ff]/60 mb-2 font-medium">Support:</div>
                {data.supportResistance.support.slice(0, 2).map((level, i) => (
                  <div key={i} className="font-mono text-green-400 font-semibold mb-1">
                    {formatPrice(level)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const AdvancedTradingChart: React.FC = () => {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('candlestick');
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLive, setIsLive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const loadData = useCallback(() => {
    setIsLoading(true);
    // Simulate API call with realistic delay
    setTimeout(() => {
      const newData = generateMockData(timeframe, 100);
      setData(newData);
      setIsLoading(false);
    }, 300);
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
          volume: lastCandle.volume + Math.random() * 100000,
          timestamp: Date.now()
        };
        
        return [...prevData.slice(0, -1), updatedCandle];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleTooltipHover = useCallback((data: TooltipData | null, x: number, y: number) => {
    setTooltipData(data);
    setTooltipPosition({ x, y });
  }, []);

  const chartDimensions = { width: 900, height: 500 };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="overflow-hidden bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/60 backdrop-blur-xl border-[#33e1da]/20">
        {/* Header */}
        <CardHeader className="border-b border-[#33e1da]/10 bg-gradient-to-r from-[#1e2a44]/20 to-transparent">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 text-[#eaf2ff]">
                    Bitcoin
                    <span className="text-sm font-normal text-[#eaf2ff]/60">BTC/USD</span>
                    {isLive && (
                      <motion.div 
                        className="flex items-center gap-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                        <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">LIVE</span>
                      </motion.div>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-3xl font-bold text-[#eaf2ff]">{formatPrice(currentPrice)}</span>
                    <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="text-sm font-bold">
                      {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.abs(priceChangePercent).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20 bg-[#1e2a44]/60 border-[#33e1da]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2a44]/95 border-[#33e1da]/30">
                  <SelectItem value="1m">1m</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="4h">4h</SelectItem>
                  <SelectItem value="1d">1d</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={chartType} onValueChange={setChartType}>
                <TabsList className="bg-[#1e2a44]/60">
                  <TabsTrigger value="candlestick" className="text-xs">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Candles
                  </TabsTrigger>
                  <TabsTrigger value="line" className="text-xs">
                    <LineChart className="w-4 h-4 mr-1" />
                    Line
                  </TabsTrigger>
                  <TabsTrigger value="area" className="text-xs">
                    <AreaChart className="w-4 h-4 mr-1" />
                    Area
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="font-semibold"
              >
                <Zap className="w-4 h-4 mr-1" />
                {isLive ? "Live" : "Paused"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chart */}
        <CardContent className="p-6">
          <div ref={containerRef} className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <motion.div 
                  className="w-16 h-16 border-4 border-[#33e1da]/30 border-t-[#33e1da] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <div className="relative">
                <CandlestickChart
                  data={data}
                  width={chartDimensions.width}
                  height={chartDimensions.height}
                  onHover={handleTooltipHover}
                />
                
                <AnimatePresence>
                  <AdvancedTooltip
                    data={tooltipData}
                    x={tooltipPosition.x}
                    y={tooltipPosition.y}
                    visible={!!tooltipData}
                  />
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-t border-[#33e1da]/10 bg-gradient-to-r from-[#1e2a44]/10 to-transparent">
          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#33e1da]" />
              <span className="text-sm text-[#eaf2ff]/70">24h Volume</span>
            </div>
            <div className="text-lg font-bold text-[#eaf2ff]">
              {data.length > 0 ? formatVolume(data.reduce((sum, d) => sum + d.volume, 0) / data.length) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[#eaf2ff]/70">24h High</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {data.length > 0 ? formatPrice(Math.max(...data.map(d => d.high))) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[#eaf2ff]/70">24h Low</span>
            </div>
            <div className="text-lg font-bold text-red-400">
              {data.length > 0 ? formatPrice(Math.min(...data.map(d => d.low))) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#33e1da]" />
              <span className="text-sm text-[#eaf2ff]/70">Market Cap</span>
            </div>
            <div className="text-lg font-bold text-[#33e1da]">
              $847.2B
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 p-6 border-t border-[#33e1da]/10 justify-center bg-gradient-to-r from-[#1e2a44]/10 to-transparent">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy BTC
          </Button>
          <Button variant="destructive" className="font-semibold">
            <TrendingDown className="w-4 h-4 mr-2" />
            Sell BTC
          </Button>
          <Button variant="outline" className="font-semibold">
            <Activity className="w-4 h-4 mr-2" />
            Set Alert
          </Button>
          <Button variant="outline" className="font-semibold">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
};
