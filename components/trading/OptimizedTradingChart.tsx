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
import { useRealMarketData as useMarketData, type CandlestickData, type TechnicalIndicators } from "@/hooks/useRealMarketData";
import { PerformanceMonitor, usePerformanceTracking } from "@/components/performance/PerformanceMonitor";
import { formatPriceEfficient, formatVolumeEfficient } from "@/utils/dataBuffer";

interface SupportResistance {
  support: number[];
  resistance: number[];
}

interface TooltipData extends CandlestickData {
  indicators: TechnicalIndicators;
  supportResistance: SupportResistance;
}

// Use efficient formatters from dataBuffer utility
const formatPrice = formatPriceEfficient;
const formatVolume = formatVolumeEfficient;

// Optimized Canvas Chart Component with GPU acceleration
const OptimizedCandlestickChart: React.FC<{
  data: CandlestickData[];
  width: number;
  height: number;
  onHover: (data: TooltipData | null, x: number, y: number) => void;
  getTechnicalIndicators: (index: number) => TechnicalIndicators;
  getSupportResistanceLevels: () => SupportResistance;
}> = ({ data, width, height, onHover, getTechnicalIndicators, getSupportResistanceLevels }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const lastDrawTime = useRef<number>(0);
  
  const padding = { top: 20, right: 80, bottom: 40, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Memoize expensive calculations
  const { priceRange, supportResistance } = useMemo(() => {
    if (data.length === 0) return { priceRange: { min: 0, max: 0 }, supportResistance: { support: [], resistance: [] } };
    
    const allPrices = data.flatMap(d => [d.high, d.low]);
    const range = {
      min: Math.min(...allPrices) * 0.995,
      max: Math.max(...allPrices) * 1.005
    };
    
    return {
      priceRange: range,
      supportResistance: getSupportResistanceLevels()
    };
  }, [data, getSupportResistanceLevels]);

  // Optimized drawing function with improved memory management
  const drawChart = useCallback(() => {
    const now = performance.now();
    if (now - lastDrawTime.current < 16.67) return; // Limit to 60fps
    lastDrawTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false, // Disable alpha for better performance
      desynchronized: true, // Allow GPU acceleration
      willReadFrequently: false // Optimize for write operations
    });
    if (!ctx) return;

    // Optimized DPI handling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Further reduced for performance
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    
    // Only resize canvas if dimensions changed
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.scale(dpr, dpr);
    }
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear with solid background for better performance
    ctx.fillStyle = '#0a0f1f';
    ctx.fillRect(0, 0, width, height);

    const priceToY = (price: number) => 
      padding.top + chartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;

    const indexToX = (index: number) => 
      padding.left + (index / (data.length - 1)) * chartWidth;

    // Draw grid with reduced complexity
    ctx.strokeStyle = 'rgba(51, 225, 218, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Price labels (reduced frequency for performance)
    ctx.fillStyle = 'rgba(234, 242, 255, 0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      const price = priceRange.max - (i / 5) * (priceRange.max - priceRange.min);
      ctx.fillText(formatPrice(price), padding.left - 10, y + 4);
    }

    // Draw support/resistance levels
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    [...supportResistance.support, ...supportResistance.resistance].forEach(level => {
      const y = priceToY(level);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Highly optimized candlestick rendering with reduced allocations
    const candleWidth = Math.max(2, chartWidth / data.length * 0.8);
    const dataLength = data.length;
    
    // Pre-allocate arrays with known size to avoid dynamic resizing
    const greenCandles: Array<{ x: number; openY: number; closeY: number; highY: number; lowY: number; hover: boolean }> = [];
    const redCandles: Array<{ x: number; openY: number; closeY: number; highY: number; lowY: number; hover: boolean }> = [];
    
    // Single pass through data with minimal object creation
    for (let index = 0; index < dataLength; index++) {
      const candle = data[index];
      const x = indexToX(index);
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      const hover = hoveredIndex === index;
      
      const candleData = { x, openY, closeY, highY, lowY, hover };
      
      if (candle.close > candle.open) {
        greenCandles.push(candleData);
      } else {
        redCandles.push(candleData);
      }
    }

    // Draw green candles
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    
    greenCandles.forEach(({ x, openY, closeY, highY, lowY, hover }) => {
      const alpha = hover ? 1 : 0.8;
      ctx.globalAlpha = alpha;
      
      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
      ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
    });

    // Draw red candles
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    
    redCandles.forEach(({ x, openY, closeY, highY, lowY, hover }) => {
      const alpha = hover ? 1 : 0.8;
      ctx.globalAlpha = alpha;
      
      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
      ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
    });

    ctx.globalAlpha = 1;

    // Draw technical indicators (optimized)
    if (data.length > 20) {
      // SMA20 line
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let smaStarted = false;
      data.forEach((_, index) => {
        if (index >= 19) {
          const indicators = getTechnicalIndicators(index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma20);
          
          if (!smaStarted) {
            ctx.moveTo(x, y);
            smaStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Time labels (reduced for performance)
    ctx.fillStyle = 'rgba(234, 242, 255, 0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const labelCount = Math.min(6, data.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const x = indexToX(index);
      const date = new Date(data[index].timestamp);
      
      ctx.fillText(
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        x,
        height - 10
      );
    }
  }, [data, width, height, priceRange, hoveredIndex, supportResistance, chartWidth, chartHeight, getTechnicalIndicators]);

  // Optimized animation loop
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

  // Optimized mouse handling with throttling
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
      
      if (clampedIndex !== hoveredIndex) {
        setHoveredIndex(clampedIndex);
        
        const candle = data[clampedIndex];
        const indicators = getTechnicalIndicators(clampedIndex);
        
        const tooltipData: TooltipData = {
          ...candle,
          indicators,
          supportResistance
        };
        
        onHover(tooltipData, e.clientX, e.clientY);
      }
    } else {
      if (hoveredIndex !== null) {
        setHoveredIndex(null);
        onHover(null, 0, 0);
      }
    }
  }, [data, width, height, chartWidth, padding, hoveredIndex, getTechnicalIndicators, supportResistance, onHover]);

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
      style={{ 
        background: 'transparent',
        willChange: 'transform', // Hint for GPU acceleration
        transform: 'translateZ(0)' // Force GPU layer
      }}
    />
  );
};

// Optimized Line Chart Component
const OptimizedLineChart: React.FC<{
  data: CandlestickData[];
  width: number;
  height: number;
  onHover: (data: TooltipData | null, x: number, y: number) => void;
  getTechnicalIndicators: (index: number) => TechnicalIndicators;
  getSupportResistanceLevels: () => SupportResistance;
}> = ({ data, width, height, onHover, getTechnicalIndicators, getSupportResistanceLevels }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const lastDrawTime = useRef<number>(0);
  
  const padding = { top: 20, right: 80, bottom: 40, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Memoize expensive calculations
  const { priceRange, supportResistance } = useMemo(() => {
    if (data.length === 0) return { priceRange: { min: 0, max: 0 }, supportResistance: { support: [], resistance: [] } };
    
    const allPrices = data.map(d => d.close);
    const range = {
      min: Math.min(...allPrices) * 0.995,
      max: Math.max(...allPrices) * 1.005
    };
    
    return {
      priceRange: range,
      supportResistance: getSupportResistanceLevels()
    };
  }, [data, getSupportResistanceLevels]);

  // Optimized drawing function for line chart
  const drawChart = useCallback(() => {
    const now = performance.now();
    if (now - lastDrawTime.current < 16.67) return; // Limit to 60fps
    lastDrawTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;

    // Optimized DPI handling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.scale(dpr, dpr);
    }
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear with solid background
    ctx.fillStyle = '#0a0f1f';
    ctx.fillRect(0, 0, width, height);

    const priceToY = (price: number) => 
      padding.top + chartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;

    const indexToX = (index: number) => 
      padding.left + (index / (data.length - 1)) * chartWidth;

    // Draw grid
    ctx.strokeStyle = 'rgba(51, 225, 218, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Price labels
    ctx.fillStyle = 'rgba(234, 242, 255, 0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      const price = priceRange.max - (i / 5) * (priceRange.max - priceRange.min);
      ctx.fillText(formatPrice(price), padding.left - 10, y + 4);
    }

    // Draw support/resistance levels
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    [...supportResistance.support, ...supportResistance.resistance].forEach(level => {
      const y = priceToY(level);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw main price line
    ctx.strokeStyle = '#33e1da';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    data.forEach((candle, index) => {
      const x = indexToX(index);
      const y = priceToY(candle.close);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw hover point
    if (hoveredIndex !== null) {
      const x = indexToX(hoveredIndex);
      const y = priceToY(data[hoveredIndex].close);
      
      ctx.fillStyle = '#33e1da';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#0a0f1f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw technical indicators (SMA20)
    if (data.length > 20) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let smaStarted = false;
      data.forEach((_, index) => {
        if (index >= 19) {
          const indicators = getTechnicalIndicators(index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma20);
          
          if (!smaStarted) {
            ctx.moveTo(x, y);
            smaStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Time labels
    ctx.fillStyle = 'rgba(234, 242, 255, 0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const labelCount = Math.min(6, data.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const x = indexToX(index);
      const date = new Date(data[index].timestamp);
      
      ctx.fillText(
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        x,
        height - 10
      );
    }
  }, [data, width, height, priceRange, hoveredIndex, supportResistance, chartWidth, chartHeight, getTechnicalIndicators]);

  // Animation loop
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

  // Mouse handling
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
      
      if (clampedIndex !== hoveredIndex) {
        setHoveredIndex(clampedIndex);
        
        const candle = data[clampedIndex];
        const indicators = getTechnicalIndicators(clampedIndex);
        
        const tooltipData: TooltipData = {
          ...candle,
          indicators,
          supportResistance
        };
        
        onHover(tooltipData, e.clientX, e.clientY);
      }
    } else {
      if (hoveredIndex !== null) {
        setHoveredIndex(null);
        onHover(null, 0, 0);
      }
    }
  }, [data, width, height, chartWidth, padding, hoveredIndex, getTechnicalIndicators, supportResistance, onHover]);

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
      style={{ 
        background: 'transparent',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
};

// Optimized Area Chart Component
const OptimizedAreaChart: React.FC<{
  data: CandlestickData[];
  width: number;
  height: number;
  onHover: (data: TooltipData | null, x: number, y: number) => void;
  getTechnicalIndicators: (index: number) => TechnicalIndicators;
  getSupportResistanceLevels: () => SupportResistance;
}> = ({ data, width, height, onHover, getTechnicalIndicators, getSupportResistanceLevels }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const lastDrawTime = useRef<number>(0);
  
  const padding = { top: 20, right: 80, bottom: 40, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Memoize expensive calculations
  const { priceRange, supportResistance } = useMemo(() => {
    if (data.length === 0) return { priceRange: { min: 0, max: 0 }, supportResistance: { support: [], resistance: [] } };
    
    const allPrices = data.map(d => d.close);
    const range = {
      min: Math.min(...allPrices) * 0.995,
      max: Math.max(...allPrices) * 1.005
    };
    
    return {
      priceRange: range,
      supportResistance: getSupportResistanceLevels()
    };
  }, [data, getSupportResistanceLevels]);

  // Optimized drawing function for area chart
  const drawChart = useCallback(() => {
    const now = performance.now();
    if (now - lastDrawTime.current < 16.67) return; // Limit to 60fps
    lastDrawTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;

    // Optimized DPI handling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.scale(dpr, dpr);
    }
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear with solid background
    ctx.fillStyle = '#0a0f1f';
    ctx.fillRect(0, 0, width, height);

    const priceToY = (price: number) => 
      padding.top + chartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;

    const indexToX = (index: number) => 
      padding.left + (index / (data.length - 1)) * chartWidth;

    // Draw grid
    ctx.strokeStyle = 'rgba(51, 225, 218, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Price labels
    ctx.fillStyle = 'rgba(234, 242, 255, 0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      const price = priceRange.max - (i / 5) * (priceRange.max - priceRange.min);
      ctx.fillText(formatPrice(price), padding.left - 10, y + 4);
    }

    // Draw support/resistance levels
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    [...supportResistance.support, ...supportResistance.resistance].forEach(level => {
      const y = priceToY(level);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(51, 225, 218, 0.3)');
    gradient.addColorStop(0.5, 'rgba(51, 225, 218, 0.1)');
    gradient.addColorStop(1, 'rgba(51, 225, 218, 0.02)');

    // Draw area fill
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    // Start from bottom left
    const firstX = indexToX(0);
    const bottomY = height - padding.bottom;
    ctx.moveTo(firstX, bottomY);
    
    // Draw the price line
    data.forEach((candle, index) => {
      const x = indexToX(index);
      const y = priceToY(candle.close);
      ctx.lineTo(x, y);
    });
    
    // Close the area by going to bottom right and back to start
    const lastX = indexToX(data.length - 1);
    ctx.lineTo(lastX, bottomY);
    ctx.lineTo(firstX, bottomY);
    ctx.fill();

    // Draw main price line on top
    ctx.strokeStyle = '#33e1da';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    data.forEach((candle, index) => {
      const x = indexToX(index);
      const y = priceToY(candle.close);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw hover point
    if (hoveredIndex !== null) {
      const x = indexToX(hoveredIndex);
      const y = priceToY(data[hoveredIndex].close);
      
      ctx.fillStyle = '#33e1da';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#0a0f1f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw technical indicators (SMA20)
    if (data.length > 20) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let smaStarted = false;
      data.forEach((_, index) => {
        if (index >= 19) {
          const indicators = getTechnicalIndicators(index);
          const x = indexToX(index);
          const y = priceToY(indicators.sma20);
          
          if (!smaStarted) {
            ctx.moveTo(x, y);
            smaStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Time labels
    ctx.fillStyle = 'rgba(234, 242, 255, 0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const labelCount = Math.min(6, data.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const x = indexToX(index);
      const date = new Date(data[index].timestamp);
      
      ctx.fillText(
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        x,
        height - 10
      );
    }
  }, [data, width, height, priceRange, hoveredIndex, supportResistance, chartWidth, chartHeight, getTechnicalIndicators]);

  // Animation loop
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

  // Mouse handling
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
      
      if (clampedIndex !== hoveredIndex) {
        setHoveredIndex(clampedIndex);
        
        const candle = data[clampedIndex];
        const indicators = getTechnicalIndicators(clampedIndex);
        
        const tooltipData: TooltipData = {
          ...candle,
          indicators,
          supportResistance
        };
        
        onHover(tooltipData, e.clientX, e.clientY);
      }
    } else {
      if (hoveredIndex !== null) {
        setHoveredIndex(null);
        onHover(null, 0, 0);
      }
    }
  }, [data, width, height, chartWidth, padding, hoveredIndex, getTechnicalIndicators, supportResistance, onHover]);

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
      style={{ 
        background: 'transparent',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
};

// Enhanced tooltip with better performance
const EnhancedTooltip: React.FC<{
  data: TooltipData | null;
  x: number;
  y: number;
  visible: boolean;
}> = React.memo(({ data, x, y, visible }) => {
  if (!visible || !data) return null;

  const change = data.close - data.open;
  const changePercent = (change / data.open) * 100;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: Math.min(x + 15, window.innerWidth - 340),
        top: Math.max(y - 280, 10)
      }}
    >
      <div className="bg-gradient-to-br from-[#1e2a44]/98 to-[#0a0f1f]/98 backdrop-blur-xl border border-[#33e1da]/25 rounded-xl shadow-2xl p-5 min-w-[340px] max-w-[360px]">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#33e1da]/15 pb-3">
            <div className="text-sm font-medium text-[#eaf2ff]/70">
              {new Date(data.timestamp).toLocaleString()}
            </div>
            <Badge 
              variant={isPositive ? "default" : "destructive"} 
              className={cn(
                "text-xs font-bold",
                isPositive ? "bg-green-500/25 text-green-400 border-green-500/40" : "bg-red-500/25 text-red-400 border-red-500/40"
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>

          {/* OHLCV Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60 text-xs">Open:</span>
                <span className="font-mono text-[#eaf2ff] font-semibold">{formatPrice(data.open)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60 text-xs">High:</span>
                <span className="font-mono text-green-400 font-semibold">{formatPrice(data.high)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60 text-xs">Low:</span>
                <span className="font-mono text-red-400 font-semibold">{formatPrice(data.low)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60 text-xs">Close:</span>
                <span className={cn(
                  "font-mono font-semibold",
                  isPositive ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatPrice(data.close)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60 text-xs">Volume:</span>
                <span className="font-mono text-[#33e1da] font-semibold">{formatVolume(data.volume)}</span>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="border-t border-[#33e1da]/15 pt-3">
            <div className="text-xs font-semibold text-[#33e1da] mb-3 uppercase tracking-wider">Technical Analysis</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">RSI(14):</span>
                <span className={cn(
                  "font-mono font-bold",
                  data.indicators.rsi > 70 ? 'text-red-400' : 
                  data.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
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
                <span className="text-[#eaf2ff]/60">MA(20):</span>
                <span className="font-mono text-blue-400 font-semibold text-xs">{formatPrice(data.indicators.sma20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#eaf2ff]/60">MA(50):</span>
                <span className="font-mono text-purple-400 font-semibold text-xs">{formatPrice(data.indicators.sma50)}</span>
              </div>
            </div>
          </div>

          {/* Support/Resistance */}
          <div className="border-t border-[#33e1da]/15 pt-3">
            <div className="text-xs font-semibold text-[#33e1da] mb-3 uppercase tracking-wider">Key Levels</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[#eaf2ff]/60 mb-2 font-medium">Resistance:</div>
                <div className="space-y-1">
                  {data.supportResistance.resistance.slice(0, 2).map((level, i) => (
                    <div key={i} className="font-mono text-red-400 font-semibold">
                      {formatPrice(level)}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[#eaf2ff]/60 mb-2 font-medium">Support:</div>
                <div className="space-y-1">
                  {data.supportResistance.support.slice(0, 2).map((level, i) => (
                    <div key={i} className="font-mono text-green-400 font-semibold">
                      {formatPrice(level)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

EnhancedTooltip.displayName = 'EnhancedTooltip';

export const OptimizedTradingChart: React.FC = () => {
  const {
    marketData,
    candlestickData,
    isLoading,
    error,
    getTechnicalIndicators,
    getSupportResistanceLevels,
    generateCandlestickData
  } = useMarketData('BTC', 30000); // Update every 30 seconds for real API calls
  
  const { trackUpdate } = usePerformanceTracking('OptimizedTradingChart');

  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('candlestick');
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLive, setIsLive] = useState(true);

  const currentPrice = marketData?.price || 0;
  const priceChangePercent = marketData?.changePercent24h || 0;

  // Update chart data when timeframe changes
  useEffect(() => {
    if (!isLoading) {
      generateCandlestickData(timeframe);
    }
  }, [timeframe, generateCandlestickData, isLoading]);

  const handleTooltipHover = useCallback((data: TooltipData | null, x: number, y: number) => {
    setTooltipData(data);
    setTooltipPosition({ x, y });
    trackUpdate();
  }, [trackUpdate]);

  const chartDimensions = { width: 900, height: 500 };

  if (error) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/60 backdrop-blur-xl border-[#33e1da]/20">
        <div className="text-red-400 mb-4 font-semibold">⚠️ Error loading real Bitcoin data</div>
        <div className="text-[#eaf2ff]/70 mb-4">{error}</div>
        <div className="text-sm text-[#33e1da]">
          Real-time data from CoinGecko API unavailable
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#33e1da] text-black hover:bg-[#33e1da]/80"
        >
          Retry Connection
        </Button>
      </Card>
    );
  }

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
                        <span className="text-xs text-[#33e1da] font-medium">CoinGecko</span>
                      </motion.div>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-3xl font-bold text-[#eaf2ff]">{formatPrice(currentPrice)}</span>
                    <Badge variant={priceChangePercent >= 0 ? "default" : "destructive"} className="text-sm font-bold">
                      {priceChangePercent >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
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
          <div className="relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <motion.div
                  className="w-16 h-16 border-4 border-[#33e1da]/30 border-t-[#33e1da] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="text-[#eaf2ff]/80 font-medium">
                  Loading real Bitcoin data from CoinGecko...
                </div>
                <div className="text-[#33e1da] text-sm">
                  Fetching live market prices & generating chart
                </div>
              </div>
            ) : (
              <div className="relative">
                {chartType === 'candlestick' && (
                  <OptimizedCandlestickChart
                    data={candlestickData}
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    onHover={handleTooltipHover}
                    getTechnicalIndicators={getTechnicalIndicators}
                    getSupportResistanceLevels={getSupportResistanceLevels}
                  />
                )}
                
                {chartType === 'line' && (
                  <OptimizedLineChart
                    data={candlestickData}
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    onHover={handleTooltipHover}
                    getTechnicalIndicators={getTechnicalIndicators}
                    getSupportResistanceLevels={getSupportResistanceLevels}
                  />
                )}
                
                {chartType === 'area' && (
                  <OptimizedAreaChart
                    data={candlestickData}
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    onHover={handleTooltipHover}
                    getTechnicalIndicators={getTechnicalIndicators}
                    getSupportResistanceLevels={getSupportResistanceLevels}
                  />
                )}
                
                <AnimatePresence>
                  <EnhancedTooltip
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
              {marketData ? formatVolume(marketData.volume24h) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[#eaf2ff]/70">24h High</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {marketData ? formatPrice(marketData.high24h) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[#eaf2ff]/70">24h Low</span>
            </div>
            <div className="text-lg font-bold text-red-400">
              {marketData ? formatPrice(marketData.low24h) : '$0'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1e2a44]/40 to-[#0a0f1f]/40 border-[#33e1da]/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#33e1da]" />
              <span className="text-sm text-[#eaf2ff]/70">Market Cap</span>
            </div>
            <div className="text-lg font-bold text-[#33e1da]">
              {marketData ? formatVolume(marketData.marketCap) : '$0'}
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
      
      {/* Performance Monitor (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor enabled={true} showDetails={false} />
      )}
    </div>
  );
};
