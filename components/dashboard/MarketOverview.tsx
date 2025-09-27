'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bitcoin, BadgeEuro, X, BadgeIndianRupee, BadgeSwissFranc, TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useCryptoPrices } from '@/hooks/api/useCryptoPrices';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface CryptoData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  marketCap: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  data: Array<{ value: number }>;
}

// Market data for multiple cryptocurrencies (mock data - can be replaced with real API calls)
const marketData = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: BadgeEuro,
    color: '#627EEA',
    fallbackPrice: 4471.69,
    fallbackChange: -1.31,
    fallbackMarketCap: '$539,749,941,707.40'
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    icon: X,
    color: '#23292F',
    fallbackPrice: 3.00,
    fallbackChange: -1.11,
    fallbackMarketCap: '$179,492,030,212.14'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    icon: BadgeIndianRupee,
    color: '#9945FF',
    fallbackPrice: 239.21,
    fallbackChange: -1.93,
    fallbackMarketCap: '$129,899,502,213.55'
  },
  {
    symbol: 'CRO',
    name: 'Cronos',
    icon: BadgeSwissFranc,
    color: '#003CDA',
    fallbackPrice: 0.232679,
    fallbackChange: -0.34,
    fallbackMarketCap: '$8,100,649,111.74'
  }
];

function CryptoCard({ crypto }: { crypto: any }) {
  const Icon = crypto.icon;
  const isNegative = crypto.change < 0;
  const changeDisplay = `${isNegative ? '' : '+'}${crypto.change.toFixed(2)}%`;
  const priceDisplay = crypto.price >= 1 ?
    `$${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
    `$${crypto.price.toFixed(6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative"
    >
      <Card className="glass-card glass-hover card-glow-hover transition-all duration-300 group relative overflow-hidden border-border/50">
        {/* Animated background effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${isNegative ? 'from-red-500/10 to-red-600/5' : 'from-green-500/10 to-green-600/5'}`} />

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: crypto.color }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{crypto.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {crypto.symbol}
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge variant={isNegative ? "destructive" : "default"} className="text-xs flex items-center gap-1">
                {isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {changeDisplay}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" />
                Live
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-2xl font-bold text-foreground">{priceDisplay}</div>
            <div className={`text-sm font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
              {changeDisplay} (24h)
            </div>
          </div>

          <div className="h-16 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crypto.chartData}>
                <XAxis hide />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 border border-border rounded-lg p-2 shadow-lg">
                          <p className="text-sm font-medium">${payload[0].value?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(label).toLocaleTimeString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isNegative ? "#ef4444" : "#10b981"}
                  strokeWidth={2.5}
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Market cap</span>
              <span className="font-mono">{crypto.marketCap}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MarketOverview() {
  const { data: liveBitcoinData, isLoading, error, refetch } = useCryptoPrices();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [cryptoList, setCryptoList] = useState<any[]>([]);

  // Process live Bitcoin data and create chart data for other cryptos
  useEffect(() => {
    const processedCryptos = [];

    // Bitcoin (live data)
    if (liveBitcoinData && liveBitcoinData.length > 0) {
      const currentPrice = liveBitcoinData[liveBitcoinData.length - 1]?.close || 0;
      const previousPrice = liveBitcoinData[liveBitcoinData.length - 2]?.close || currentPrice;
      const change = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

      const chartData = liveBitcoinData.slice(-12).map((point, index) => ({
        value: point.close,
        time: new Date(parseInt(point.t)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      processedCryptos.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: Bitcoin,
        color: '#F7931A',
        price: currentPrice,
        change: change,
        marketCap: '$2,306,777,649,371.17', // This would come from another API call
        chartData: chartData,
        isLive: true
      });
    } else {
      // Fallback Bitcoin data
      const mockChartData = Array.from({ length: 12 }, (_, i) => {
        const basePrice = 115782;
        const variation = (Math.random() - 0.5) * 2000;
        return {
          value: basePrice + variation,
          time: new Date(Date.now() - (11 - i) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      processedCryptos.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: Bitcoin,
        color: '#F7931A',
        price: 115782,
        change: -0.77,
        marketCap: '$2,306,777,649,371.17',
        chartData: mockChartData,
        isLive: false
      });
    }

    // Add other cryptocurrencies with simulated data
    marketData.forEach(crypto => {
      const mockChartData = Array.from({ length: 12 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.1;
        return {
          value: crypto.fallbackPrice * (1 + variation),
          time: new Date(Date.now() - (11 - i) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      processedCryptos.push({
        ...crypto,
        price: crypto.fallbackPrice,
        change: crypto.fallbackChange,
        marketCap: crypto.fallbackMarketCap,
        chartData: mockChartData,
        isLive: false
      });
    });

    setCryptoList(processedCryptos);
    setLastUpdate(new Date());
  }, [liveBitcoinData]);

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Market overview
            {isLoading && <RefreshCw size={18} className="animate-spin text-primary" />}
          </h2>
          <p className="text-muted-foreground">Stay on top of leading assets before the next alert fires.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {error && <span className="text-red-400 ml-2">(Using cached data)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          <Link href="/market">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>View full market board</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 gap-4">
          {cryptoList.map((crypto) => (
            <CryptoCard key={crypto.symbol} crypto={crypto} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}