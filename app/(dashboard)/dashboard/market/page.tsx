'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { useMarketData, formatPrice, formatMarketCap, formatVolume, formatPercentage } from '@/hooks/useLegacyMarketData';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase/browserClient';
import { toast } from 'sonner';

export default function MarketDashboardPage() {
  const { isSignedIn, user } = useUser();
  const { cryptoData, marketStats, loading, error, lastUpdated, refetch } = useMarketData();
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change_percentage_24h' | 'volume_24h'>('market_cap');

  // Load favorites from Supabase
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const client = supabase();
        const { data, error } = await client
          .from('watchlist')
          .select('symbol')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching favorites:', error.message);
          return;
        }
        if (data) {
          setFavorites(data.map((d: any) => d.symbol));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, [user]);

  // Persist favorites change to Supabase
  const updateFavorite = async (cryptoId: string, add: boolean) => {
    if (!user) return;
    const client = supabase();
    try {
      if (add) {
        const { error } = await client.from('watchlist').insert({ user_id: user.id, symbol: cryptoId });
        if (error) throw error;
      } else {
        const { error } = await client
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('symbol', cryptoId);
        if (error) throw error;
      }
    } catch (e: any) {
      console.error('Failed to update favorite:', e);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
      setFavorites(prev => {
        // revert optimistic update
        if (add) {
          return prev.filter(id => id !== cryptoId);
        } else {
          return [...prev, cryptoId];
        }
      });
    }
  };

  // Filter and sort crypto data
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
    setFavorites(prev => {
      const add = !prev.includes(cryptoId);
      const updated = add ? [...prev, cryptoId] : prev.filter(id => id !== cryptoId);
      updateFavorite(cryptoId, add);
      return updated;
    });
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
            stroke={isPositive ? '#10b981' : '#ef4444'}
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
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
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
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
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
                          <div className="relative w-6 h-6">
                            <Image
                              src={crypto.image}
                              alt={crypto.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                            <div
                              className="absolute inset-0 bg-[#33E1DA]/20 rounded-full flex items-center justify-center"
                              style={{ display: 'none' }}
                            >
                              <span className="text-[#33E1DA] text-xs font-bold">
                                {crypto.symbol.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-white">{crypto.symbol.toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{formatPrice(crypto.current_price)}</p>
                          <p className={cn(
                            'text-sm font-medium',
                            isPositive ? 'text-green-400' : 'text-red-400'
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
                    <th className="text-left py-3 px-3 text-white/70 font-medium text-sm w-16">Rank</th>
                    <th className="text-left py-3 px-3 text-white/70 font-medium text-sm min-w-[200px]">Name</th>
                    <th className="text-right py-3 px-3 text-white/70 font-medium text-sm w-24">Price</th>
                    <th className="text-right py-3 px-3 text-white/70 font-medium text-sm w-28">24h Change</th>
                    <th className="text-right py-3 px-3 text-white/70 font-medium text-sm w-32">Market Cap</th>
                    <th className="text-right py-3 px-3 text-white/70 font-medium text-sm w-28">Volume</th>
                    <th className="text-center py-3 px-3 text-white/70 font-medium text-sm w-20">7d Chart</th>
                    <th className="text-center py-3 px-3 text-white/70 font-medium text-sm w-16">Watch</th>
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
                        <td className="py-4 px-3 align-middle">
                          <span className="text-white/60 text-sm font-medium">
                            #{crypto.market_cap_rank || index + 1}
                          </span>
                        </td>

                        <td className="py-4 px-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              <Image
                                src={crypto.image}
                                alt={crypto.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const placeholder = target.nextElementSibling as HTMLElement;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                              <div
                                className="absolute inset-0 bg-[#33E1DA]/20 rounded-full flex items-center justify-center"
                                style={{ display: 'none' }}
                              >
                                <span className="text-[#33E1DA] text-sm font-bold">
                                  {crypto.symbol.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold truncate">{crypto.name}</p>
                              <p className="text-white/60 text-sm">{crypto.symbol.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-3 text-right align-middle">
                          <p className="text-white font-bold whitespace-nowrap">{formatPrice(crypto.current_price)}</p>
                        </td>

                        <td className="py-4 px-3 text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            {isPositive ? (
                              <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                            )}
                            <span className={cn(
                              'font-semibold whitespace-nowrap',
                              isPositive ? 'text-green-400' : 'text-red-400'
                            )}>
                              {formatPercentage(crypto.price_change_percentage_24h || 0)}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm whitespace-nowrap">
                            {isPositive ? '+' : ''}{formatPrice(Math.abs(crypto.price_change_24h || 0))}
                          </p>
                        </td>

                        <td className="py-4 px-3 text-right align-middle">
                          <p className="text-white font-medium whitespace-nowrap">{formatMarketCap(crypto.market_cap)}</p>
                        </td>

                        <td className="py-4 px-3 text-right align-middle">
                          <p className="text-white/70 whitespace-nowrap">{formatVolume(crypto.volume_24h)}</p>
                        </td>

                        <td className="py-4 px-3 text-center align-middle">
                          {crypto.sparkline_in_7d && (
                            <div className="flex justify-center">
                              <MiniSparkline
                                data={crypto.sparkline_in_7d.price}
                                isPositive={isPositive}
                              />
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-3 text-center align-middle">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(crypto.id)}
                            className="p-1 h-8 w-8 hover:bg-white/10"
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
  );
}
