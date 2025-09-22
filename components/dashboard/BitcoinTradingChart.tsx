'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBitcoinChart } from '@/hooks/api/useBitcoinChart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, LineChartIcon, Zap, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandlestickBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: any;
}

const CandlestickBar = ({ x, y, width, height, payload }: CandlestickBarProps) => {
  const { open, high, low, close } = payload;
  const isGreen = close > open;
  const color = isGreen ? '#10b981' : '#ef4444';

  const bodyHeight = Math.abs(close - open);
  const bodyY = isGreen ? y + (height - bodyHeight) : y;

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={bodyHeight || 1}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatVolume = (volume: number) => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  }
  return volume.toString();
};

export default function BitcoinTradingChart() {
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState<'candles' | 'line' | 'area'>('candles');
  const { data, isLoading, refetch } = useBitcoinChart('1');

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Failed to load chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.price_change_24h > 0;
  const priceColor = isPositive ? 'text-green-500' : 'text-red-500';
  const bgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Bitcoin</h2>
                <p className="text-sm text-slate-400">BTC/USD • <Badge variant="secondary" className="bg-green-500/20 text-green-400">LIVE</Badge> CoinGecko</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={timeframe === '1h' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('1h')}
                className="text-xs"
              >
                1h
              </Button>
              <Button
                variant={chartType === 'candles' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('candles')}
              >
                <BarChart3 className="h-4 w-4" />
                Candles
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                <TrendingUp className="h-4 w-4" />
                Area
              </Button>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-baseline space-x-4 mt-4">
          <div className="text-4xl font-bold text-white">
            {formatPrice(data.current_price)}
          </div>
          <div className={cn("flex items-center space-x-1", priceColor)}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{data.price_change_24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {/* Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'candles' ? (
              <BarChart data={data.chart_data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  domain={['dataMin - 100', 'dataMax + 100']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={formatPrice}
                />
                <Bar
                  dataKey="high"
                  shape={CandlestickBar}
                />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={data.chart_data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  domain={['dataMin - 100', 'dataMax + 100']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={formatPrice}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <LineChart data={data.chart_data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  domain={['dataMin - 100', 'dataMax + 100']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={formatPrice}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">24h Volume</div>
            <div className="text-lg font-bold text-white">{formatVolume(data.volume_24h)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">24h High</div>
            <div className="text-lg font-bold text-green-400">{formatPrice(data.high_24h)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">24h Low</div>
            <div className="text-lg font-bold text-red-400">{formatPrice(data.low_24h)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">Market Cap</div>
            <div className="text-lg font-bold text-white">{formatVolume(data.market_cap)}</div>
          </div>
        </div>

        {/* Trading Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy BTC
          </Button>
          <Button variant="destructive" className="flex-1">
            <TrendingDown className="h-4 w-4 mr-2" />
            Sell BTC
          </Button>
          <Button variant="outline" className="sm:w-auto">
            <Zap className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
          <Button variant="outline" className="sm:w-auto">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}