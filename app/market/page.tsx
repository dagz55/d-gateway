'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star,
  StarOff,
  RefreshCw,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketData, formatPrice, formatMarketCap, formatVolume, formatPercentage, type CryptoData } from '@/hooks/useMarketData';

export default function MarketPage() {
  const { cryptoData, marketStats, loading, error, lastUpdated, refetch } = useMarketData();
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'ethereum', 'binancecoin']);
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change_percentage_24h' | 'volume_24h'>('market_cap');

  // Filter and sort data
  const filteredData = cryptoData
    .filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_change_percentage_24h':
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
        case 'volume_24h':
          return (b.volume_24h || 0) - (a.volume_24h || 0);
        default:
          return (b.market_cap || 0) - (a.market_cap || 0);
      }
    });

  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => 
      prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  // Mini sparkline component
  const MiniSparkline = ({ data, isPositive }: { data: number[], isPositive: boolean }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    // Handle flat data (all values are the same)
    if (range === 0) {
      return (
        <svg width="60" height="20" className="overflow-visible">
          <line
            x1="0"
            y1="10"
            x2="60"
            y2="10"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    const points = data.map((price, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((max - price) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="20" className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="1.5"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency Market</h1>
            <p className="text-white/70">
              Live market data • Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={refetch}
              disabled={loading}
              className="bg-[#33E1DA] hover:bg-[#33E1DA]/80 text-black"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'market_cap' ? 'default' : 'outline'}
              onClick={() => setSortBy('market_cap')}
              className="text-xs"
            >
              Market Cap
            </Button>
            <Button
              variant={sortBy === 'price_change_percentage_24h' ? 'default' : 'outline'}
              onClick={() => setSortBy('price_change_percentage_24h')}
              className="text-xs"
            >
              24h Change
            </Button>
            <Button
              variant={sortBy === 'volume_24h' ? 'default' : 'outline'}
              onClick={() => setSortBy('volume_24h')}
              className="text-xs"
            >
              Volume
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/20 mb-6">
            <CardContent className="p-4">
              <p className="text-red-400">Error loading market data: {error}</p>
              <Button onClick={refetch} className="mt-2" size="sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    {marketStats ? formatMarketCap(marketStats.totalMarketCap) : '--'}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-[#33E1DA]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">24h Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {marketStats ? formatVolume(marketStats.total24hVolume) : '--'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-[#33E1DA]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Gainers</p>
                  <p className="text-2xl font-bold text-green-400">
                    {marketStats ? marketStats.gainersCount : '--'}
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Losers</p>
                  <p className="text-2xl font-bold text-red-400">
                    {marketStats ? marketStats.losersCount : '--'}
                  </p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cryptoData
                  .filter(crypto => favorites.includes(crypto.id))
                  .slice(0, 6)
                  .map((crypto) => {
                    const isPositive = (crypto.price_change_percentage_24h || 0) >= 0;
                    return (
                      <div key={crypto.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={crypto.image} 
                              alt={crypto.name} 
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iMTIiIGZpbGw9IiMzM0UxREEiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI2IiB5PSI2Ij4KPHBhdGggZD0iTTYgMEMyLjY4NjMgMCAwIDIuNjg2MyAwIDZDMCA5LjMxMzcgMi42ODYzIDEyIDYgMTJDOS4zMTM3IDEyIDEyIDkuMzEzNyAxMiA2QzEyIDIuNjg2MyA5LjMxMzcgMCA2IDBaIiBmaWxsPSIjMDAwMDAwIi8+CjxwYXRoIGQ9Ik02IDNDNC4zNDMxNSAzIDMgNC4zNDMxNSAzIDZDNy42NTY4NSA2IDkgNC4zNDMxNSA5IDZDNi4zNDMxNSA2IDYgNy42NTY4NSA2IDlDNiA2LjM0MzE1IDcuNjU2ODUgNSA5IDVDNi4zNDMxNSA1IDUgNi4zNDMxNSA1IDhDNSA5LjY1Njg1IDYuMzQzMTUgMTEgOCAxMUM5LjY1Njg1IDExIDExIDkuNjU2ODUgMTEgOEMxMSA2LjM0MzE1IDkuNjU2ODUgNSA4IDVaIiBmaWxsPSIjMzNFMURBIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                              }}
                              loading="lazy"
                            />
                            <span className="font-semibold text-white">{crypto.symbol.toUpperCase()}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{formatPrice(crypto.current_price)}</p>
                            <p className={cn(
                              "text-sm font-medium",
                              isPositive ? "text-green-400" : "text-red-400"
                            )}>
                              {formatPercentage(crypto.price_change_percentage_24h || 0)}
                            </p>
                          </div>
                        </div>
                        {crypto.sparkline_in_7d && (
                          <MiniSparkline 
                            data={crypto.sparkline_in_7d.price} 
                            isPositive={isPositive}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Market Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Market Overview</CardTitle>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                Live Data
              </Badge>
            </div>
            <CardDescription className="text-white/60">
              Real-time cryptocurrency prices and market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full"></div>
                <span className="ml-3 text-white/70">Loading market data...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-white/70 font-medium text-sm">Rank</th>
                      <th className="text-left py-3 px-2 text-white/70 font-medium text-sm">Name</th>
                      <th className="text-right py-3 px-2 text-white/70 font-medium text-sm">Price</th>
                      <th className="text-right py-3 px-2 text-white/70 font-medium text-sm">24h Change</th>
                      <th className="text-right py-3 px-2 text-white/70 font-medium text-sm">Market Cap</th>
                      <th className="text-right py-3 px-2 text-white/70 font-medium text-sm">Volume</th>
                      <th className="text-center py-3 px-2 text-white/70 font-medium text-sm">7d Chart</th>
                      <th className="text-center py-3 px-2 text-white/70 font-medium text-sm">Watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((crypto, index) => {
                      const isPositive = (crypto.price_change_percentage_24h || 0) >= 0;
                      const isFavorite = favorites.includes(crypto.id);
                      
                      return (
                        <tr 
                          key={crypto.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-2">
                            <span className="text-white/60 text-sm font-medium">
                              #{crypto.market_cap_rank || index + 1}
                            </span>
                          </td>
                          
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <img 
                                src={crypto.image} 
                                alt={crypto.name} 
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-white font-semibold">{crypto.name}</p>
                                <p className="text-white/60 text-sm">{crypto.symbol.toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-2 text-right">
                            <p className="text-white font-bold">{formatPrice(crypto.current_price)}</p>
                          </td>
                          
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              )}
                              <span className={cn(
                                "font-semibold",
                                isPositive ? "text-green-400" : "text-red-400"
                              )}>
                                {formatPercentage(crypto.price_change_percentage_24h || 0)}
                              </span>
                            </div>
                            <p className="text-white/60 text-sm">
                              {isPositive ? '+' : ''}{formatPrice(Math.abs(crypto.price_change_24h || 0))}
                            </p>
                          </td>
                          
                          <td className="py-4 px-2 text-right">
                            <p className="text-white font-medium">{formatMarketCap(crypto.market_cap)}</p>
                          </td>
                          
                          <td className="py-4 px-2 text-right">
                            <p className="text-white/70">{formatVolume(crypto.volume_24h)}</p>
                          </td>
                          
                          <td className="py-4 px-2 text-center">
                            {crypto.sparkline_in_7d && (
                              <div className="flex justify-center">
                                <MiniSparkline 
                                  data={crypto.sparkline_in_7d.price} 
                                  isPositive={isPositive}
                                />
                              </div>
                            )}
                          </td>
                          
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(crypto.id)}
                              className="p-1 h-8 w-8"
                            >
                              {isFavorite ? (
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ) : (
                                <StarOff className="w-4 h-4 text-white/40" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Stats Footer */}
        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Data provided by CoinGecko API • Updates every 30 seconds</p>
          <p className="mt-1">
            Showing {filteredData.length} of {cryptoData.length} cryptocurrencies
          </p>
        </div>
      </div>
    </div>
  );
}
