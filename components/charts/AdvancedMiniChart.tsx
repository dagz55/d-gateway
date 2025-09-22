"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  Activity, 
  DollarSign,
  BarChart3,
  Zap,
  Target,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/icons/crypto/CryptoIcon";

// Types
interface CryptoDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  rsi: number;
  macd: number;
  support: number;
  resistance: number;
  volatility: number;
}


interface TooltipData {
  x: number;
  y: number;
  data: CryptoDataPoint;
  visible: boolean;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  color: string;
}

interface AdvancedMiniChartProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
  data?: CryptoDataPoint[];
  isPositive?: boolean;
}

// Generate realistic crypto data
const generateCryptoData = (points: number = 24, basePrice: number = 50000): CryptoDataPoint[] => {
  const data: CryptoDataPoint[] = [];
  let price = basePrice;
  let volume = 1000000 + Math.random() * 500000;
  
  for (let i = 0; i < points; i++) {
    const volatility = 0.02 + Math.random() * 0.03;
    const priceChange = (Math.random() - 0.5) * price * volatility;
    price = Math.max(price + priceChange, 1000);
    
    const volumeChange = (Math.random() - 0.5) * volume * 0.3;
    volume = Math.max(volume + volumeChange, 100000);
    
    const rsi = 30 + Math.random() * 40;
    const macd = (Math.random() - 0.5) * 1000;
    
    data.push({
      timestamp: Date.now() - (points - i) * 60000,
      price,
      volume,
      rsi,
      macd,
      support: price * (0.95 + Math.random() * 0.03),
      resistance: price * (1.02 + Math.random() * 0.03),
      volatility
    });
  }
  
  return data;
};

// Animated Tooltip Component
const AnimatedTooltip = ({
  data,
  position,
  visible,
  symbol,
  name,
}: {
  data: CryptoDataPoint;
  position: { x: number; y: number };
  visible: boolean;
  symbol: string;
  name: string;
}) => {
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(
    useTransform(x, [-100, 100], [-5, 5]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(y, [-100, 100], [5, -5]),
    springConfig
  );

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  const indicators: TechnicalIndicator[] = [
    {
      name: "RSI",
      value: data.rsi,
      signal: data.rsi > 70 ? 'sell' : data.rsi < 30 ? 'buy' : 'neutral',
      color: data.rsi > 70 ? '#ef4444' : data.rsi < 30 ? '#22c55e' : '#6b7280'
    },
    {
      name: "MACD",
      value: data.macd,
      signal: data.macd > 0 ? 'buy' : data.macd < -500 ? 'sell' : 'neutral',
      color: data.macd > 0 ? '#22c55e' : data.macd < -500 ? '#ef4444' : '#6b7280'
    },
    {
      name: "Volatility",
      value: data.volatility * 100,
      signal: data.volatility > 0.04 ? 'sell' : 'neutral',
      color: data.volatility > 0.04 ? '#f59e0b' : '#6b7280'
    }
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            rotateX,
            rotateY,
            transformOrigin: "center bottom",
            zIndex: 50,
          }}
          className="pointer-events-none"
        >
          <div className="bg-black/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">{symbol}</span>
              </div>
              <div className="text-xs text-white/60">
                {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-2xl font-bold text-white mb-1">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60">Vol:</span>
                  <span className="text-white font-medium">
                    {(data.volume / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Support/Resistance */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Support</span>
                </div>
                <div className="text-sm font-medium text-green-300">
                  ${data.support.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">Resistance</span>
                </div>
                <div className="text-sm font-medium text-red-300">
                  ${data.resistance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/60 mb-2">Technical Indicators</div>
              {indicators.map((indicator, index) => (
                <div key={indicator.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: indicator.color }}
                    />
                    <span className="text-xs text-white/60">{indicator.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">
                      {indicator.value.toFixed(2)}
                    </span>
                    <div className={cn(
                      "text-xs px-1.5 py-0.5 rounded text-white font-medium",
                      indicator.signal === 'buy' && "bg-green-500",
                      indicator.signal === 'sell' && "bg-red-500",
                      indicator.signal === 'neutral' && "bg-gray-500"
                    )}>
                      {indicator.signal.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient accent lines */}
            <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
            <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mini Chart Component
const MiniChart = ({ 
  data, 
  onHover, 
  isPositive,
  symbol 
}: { 
  data: CryptoDataPoint[]; 
  onHover: (point: CryptoDataPoint | null, position: { x: number; y: number } | null) => void;
  isPositive: boolean;
  symbol: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 80 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { pathData, volumeData, supportLine, resistanceLine, gridLines, plottedPoints } = useMemo(() => {
    if (!data.length) return { pathData: '', volumeData: [], supportLine: '', resistanceLine: '', gridLines: [], plottedPoints: [] };

    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxVolume = Math.max(...volumes);

    const padding = { top: 10, right: 10, bottom: 20, left: 20 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    // Plotted points and Price line path
    const points = data.map((point, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const y = padding.top + (1 - (point.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      return { x, y, point };
    });
    
    const pathCommands = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Volume bars
    const volumeBars = data.map((point, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const height = (point.volume / maxVolume) * 20;
      const y = dimensions.height - padding.bottom + 5;
      return { x, y, height, volume: point.volume };
    });

    // Support and resistance lines
    const avgSupport = data.reduce((sum, d) => sum + d.support, 0) / data.length;
    const avgResistance = data.reduce((sum, d) => sum + d.resistance, 0) / data.length;
    
    const supportY = padding.top + (1 - (avgSupport - minPrice) / (maxPrice - minPrice)) * chartHeight;
    const resistanceY = padding.top + (1 - (avgResistance - minPrice) / (maxPrice - minPrice)) * chartHeight;
    
    const supportPath = `M ${padding.left} ${supportY} L ${dimensions.width - padding.right} ${supportY}`;
    const resistancePath = `M ${padding.left} ${resistanceY} L ${dimensions.width - padding.right} ${resistanceY}`;

    // Grid lines
    const horizontalLines = [];
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartHeight;
      horizontalLines.push({
        path: `M ${padding.left} ${y} L ${dimensions.width - padding.right} ${y}`,
      });
    }

    const verticalLines = [];
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (i / 4) * chartWidth;
      verticalLines.push({
        path: `M ${x} ${padding.top} L ${x} ${dimensions.height - padding.bottom}`,
      });
    }

    return {
      pathData: pathCommands,
      volumeData: volumeBars,
      supportLine: supportPath,
      resistanceLine: resistancePath,
      gridLines: [...horizontalLines, ...verticalLines],
      plottedPoints: points
    };
  }, [data, dimensions]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = { left: 20, right: 10 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const relativeX = (x - padding.left) / chartWidth;
    const dataIndex = Math.round(relativeX * (data.length - 1));

    if (dataIndex >= 0 && dataIndex < data.length) {
      onHover(data[dataIndex], { x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    onHover(null, null);
  };

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {/* Grid */}
        {gridLines.map((line, index) => (
          <path
            key={index}
            d={line.path}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
            fill="none"
          />
        ))}

        {/* Support line */}
        <motion.path
          d={supportLine}
          stroke="#22c55e"
          strokeWidth="1"
          strokeDasharray="3,3"
          fill="none"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Resistance line */}
        <motion.path
          d={resistanceLine}
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="3,3"
          fill="none"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Volume bars */}
        {volumeData.map((bar, index) => (
          <motion.rect
            key={index}
            x={bar.x - 0.5}
            y={bar.y}
            width="1"
            height={bar.height}
            fill="url(#volumeGradient)"
            initial={{ height: 0 }}
            animate={{ height: bar.height }}
            transition={{ duration: 0.8, delay: index * 0.02 }}
          />
        ))}

        {/* Price line */}
        <motion.path
          d={pathData}
          stroke={isPositive ? "#34d399" : "#f87171"}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Data points */}
        {plottedPoints.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill={isPositive ? "#34d399" : "#f87171"}
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="hover:opacity-100 transition-opacity"
          />
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Main Component
export function AdvancedMiniChart({ 
  symbol, 
  name, 
  price, 
  change, 
  marketCap, 
  data: propData,
  isPositive = true 
}: AdvancedMiniChartProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    data: {} as CryptoDataPoint,
    visible: false
  });

  // Generate data if not provided
  const data = useMemo(() => {
    if (propData) return propData;
    
    // Extract base price from the price string
    const basePrice = parseFloat(price.replace(/[$,]/g, '')) || 50000;
    return generateCryptoData(24, basePrice);
  }, [propData, price]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChartHover = (point: CryptoDataPoint | null, position: { x: number; y: number } | null) => {
    if (point && position) {
      setTooltip({
        x: position.x - 140,
        y: position.y - 200,
        data: point,
        visible: true
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  if (!mounted) {
    return (
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
        <CryptoIcon symbol={symbol} size={44} />
            <div>
              <h3 className="text-base font-semibold text-white">{name}</h3>
              <p className="text-xs text-white/50">{symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-white">${price}</p>
            <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-300' : 'text-red-400'}`}>{change}</p>
          </div>
        </div>
        <div className="mt-6 h-16 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0577DA]/20 via-transparent to-transparent" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
        <CryptoIcon symbol={symbol} size={44} />
          <div>
            <h3 className="text-base font-semibold text-white">{name}</h3>
            <p className="text-xs text-white/50">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">${price}</p>
          <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-300' : 'text-red-400'}`}>{change}</p>
        </div>
      </div>

      <div className="relative mt-6 h-16 w-full">
        <MiniChart 
          data={data} 
          onHover={handleChartHover} 
          isPositive={isPositive}
          symbol={symbol}
        />
        
        {/* Animated Tooltip */}
        <AnimatedTooltip
          data={tooltip.data}
          position={{ x: tooltip.x, y: tooltip.y }}
          visible={tooltip.visible}
          symbol={symbol}
          name={name}
        />
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-white/50">
        <span>Market cap</span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] font-semibold text-white/70">
          {marketCap}
        </span>
      </div>

      <div
        className={`relative mt-6 grid grid-cols-2 gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button className="rounded-xl bg-gradient-to-r from-[#0577DA] to-[#1199FA] px-4 py-2 text-xs font-semibold text-white transition hover:from-[#0a8ae8] hover:to-[#22a9ff]">
          Buy
        </button>
        <button className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
          Trade
        </button>
      </div>
    </div>
  );
}
