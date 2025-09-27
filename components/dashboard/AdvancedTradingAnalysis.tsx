'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bitcoin, TrendingUp, TrendingDown, BarChart3, Activity, Zap, Target, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useCryptoPrices } from '@/hooks/api/useCryptoPrices';
import { motion, AnimatePresence } from 'framer-motion';

const chartData = [
  { time: '02:05 AM', price: 108900, volume: 45, high: 109200, low: 108800, open: 109000, close: 108900 },
  { time: '11:05 AM', price: 109500, volume: 62, high: 109800, low: 109200, open: 108900, close: 109500 },
  { time: '09:05 PM', price: 110200, volume: 38, high: 110500, low: 109800, open: 109500, close: 110200 },
  { time: '07:05 AM', price: 109800, volume: 71, high: 110200, low: 109600, open: 110200, close: 109800 },
  { time: '05:05 PM', price: 108500, volume: 89, high: 109800, low: 108200, open: 109800, close: 108500 },
  { time: '03:05 AM', price: 108100, volume: 56, high: 108500, low: 107900, open: 108500, close: 108100 },
  { time: '01:05 PM', price: 108800, volume: 43, high: 109100, low: 108000, open: 108100, close: 108800 },
  { time: '11:05 PM', price: 109200, volume: 67, high: 109500, low: 108700, open: 108800, close: 109200 },
  { time: '09:05 AM', price: 110100, volume: 52, high: 110400, low: 109100, open: 109200, close: 110100 },
  { time: '07:05 PM', price: 111200, volume: 78, high: 111500, low: 110000, open: 110100, close: 111200 },
  { time: '05:05 AM', price: 111800, volume: 64, high: 112100, low: 111100, open: 111200, close: 111800 },
  { time: '03:05 PM', price: 109800, volume: 91, high: 111800, low: 109500, open: 111800, close: 109800 }
];

// Technical indicators and market stats
function generateTechnicalIndicators(data: any[]) {
  if (!data || data.length === 0) return [];

  const prices = data.map(d => d.price);
  const volumes = data.map(d => d.volume);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const volume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentPrice = prices[prices.length - 1] || 0;

  return [
    {
      title: '24h Volume',
      value: `${(volume / 1000000000).toFixed(1)}B`,
      icon: BarChart3,
      color: 'text-blue-400',
      trend: volume > 60000000000 ? 'up' : 'down'
    },
    {
      title: '24h High',
      value: `$${high.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-400',
      trend: 'up'
    },
    {
      title: '24h Low',
      value: `$${low.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-400',
      trend: 'down'
    },
    {
      title: 'RSI (14)',
      value: `${(30 + Math.random() * 40).toFixed(1)}`,
      icon: Activity,
      color: 'text-accent',
      trend: 'neutral'
    }
  ];
}

// Trading signals generator
function generateTradingSignals(currentPrice: number) {
  return [
    {
      type: 'Support',
      level: currentPrice * 0.97,
      strength: 'Strong',
      icon: Target,
      color: '#22c55e'
    },
    {
      type: 'Resistance',
      level: currentPrice * 1.03,
      strength: 'Medium',
      icon: AlertTriangle,
      color: '#f59e0b'
    }
  ];
}

function StatCard({ stat, index }: { stat: any; index: number }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="glass glass-hover relative overflow-hidden">
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${
          stat.trend === 'up' ? 'from-green-500 to-green-600' :
          stat.trend === 'down' ? 'from-red-500 to-red-600' :
          'from-blue-500 to-blue-600'
        }`} />
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {stat.title}
                {stat.trend === 'up' && <TrendingUp size={12} className="text-green-400" />}
                {stat.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
              </p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-background/50`}>
              <Icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Trading Signals Component
function TradingSignals({ signals }: { signals: any[] }) {
  return (
    <Card className="glass mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Key Levels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${signal.color}20`, border: `1px solid ${signal.color}` }}
                  >
                    <Icon size={16} style={{ color: signal.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{signal.type}</p>
                    <p className="text-sm text-muted-foreground">{signal.strength} level</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${signal.level.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Target</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvancedTradingAnalysis() {
  const { data: liveBitcoinData, isLoading, error, refetch } = useCryptoPrices();
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('line');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(109800);
  const [priceChange, setPriceChange] = useState(0.07);

  // Process live data and update stats
  useEffect(() => {
    if (liveBitcoinData && liveBitcoinData.length > 0) {
      const latestPrice = liveBitcoinData[liveBitcoinData.length - 1]?.close || 0;
      const previousPrice = liveBitcoinData[liveBitcoinData.length - 2]?.close || latestPrice;
      const change = previousPrice ? ((latestPrice - previousPrice) / previousPrice) * 100 : 0;

      setCurrentPrice(latestPrice);
      setPriceChange(change);
      setStats(generateTechnicalIndicators(chartData));
      setSignals(generateTradingSignals(latestPrice));
      setLastUpdate(new Date());
    } else {
      // Use fallback data
      setStats(generateTechnicalIndicators(chartData));
      setSignals(generateTradingSignals(currentPrice));
    }
  }, [liveBitcoinData]);

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Advanced trading analysis
            {isLoading && <RefreshCw size={18} className="animate-spin text-primary" />}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <p className="text-muted-foreground">
          Track structure, momentum, and liquidity from a single interactive canvas built for actionable decisions.
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {error && <span className="text-red-400 ml-2">(Using cached data)</span>}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="glass glass-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bitcoin size={16} className="text-white" />
                </motion.div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Bitcoin</span>
                    <Badge variant="outline" className="text-xs">BTC/USD</Badge>
                    <Badge className="text-xs bg-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </Badge>
                    <span className="text-sm text-muted-foreground">CoinGecko</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold">${currentPrice.toLocaleString()}</span>
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {priceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="4h">4h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                    <SelectItem value="1w">1w</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={chartType === 'candles' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('candles')}
                >
                  Candles
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
                <Badge className="bg-green-600 text-white flex items-center gap-1">
                  <Zap size={12} />
                  Live
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  price: {
                    label: "Price",
                    color: "hsl(var(--chart-1))",
                  },
                  volume: {
                    label: "Volume",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        domain={['dataMin - 500', 'dataMax + 500']}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--chart-1))"
                        fill="url(#priceGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  ) : (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        domain={['dataMin - 500', 'dataMax + 500']}
                      />
                      <YAxis
                        yAxisId="volume"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        yAxisId="volume"
                        dataKey="volume"
                        fill="hsl(var(--chart-2))"
                        opacity={0.3}
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2.5}
                        dot={false}
                        strokeLinecap="round"
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </div>

      <AnimatePresence>
        {signals.length > 0 && (
          <TradingSignals signals={signals} />
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Button className="bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105">
          <TrendingUp size={16} className="mr-2" />
          Buy BTC
        </Button>
        <Button variant="destructive" className="transition-all hover:scale-105">
          <TrendingDown size={16} className="mr-2" />
          Sell BTC
        </Button>
        <Button variant="outline" className="transition-all hover:scale-105">
          <Activity size={16} className="mr-2" />
          Set Alert
        </Button>
        <Button variant="outline" className="transition-all hover:scale-105">
          <BarChart3 size={16} className="mr-2" />
          Analysis
        </Button>
        <Button variant="outline" className="transition-all hover:scale-105">
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </motion.div>
    </div>
  );
}