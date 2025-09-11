'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Copy, Star, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyTradingSignal {
  id: string;
  traderName: string;
  traderId: string;
  avatar?: string;
  winRate: number;
  totalFollowers: number;
  monthlyReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  isFollowing: boolean;
  recentTrades: {
    symbol: string;
    type: 'BUY' | 'SELL';
    profit: number;
    timestamp: string;
  }[];
  verified: boolean;
  rating: number;
}

const mockSignals: CopyTradingSignal[] = [
  {
    id: '1',
    traderName: 'CryptoMaster Pro',
    traderId: '@cryptomaster',
    winRate: 87.5,
    totalFollowers: 1250,
    monthlyReturn: 23.4,
    riskLevel: 'Medium',
    isFollowing: true,
    verified: true,
    rating: 4.8,
    recentTrades: [
      { symbol: 'BTC/USDT', type: 'BUY', profit: 2.3, timestamp: '2 hours ago' },
      { symbol: 'ETH/USDT', type: 'SELL', profit: 1.8, timestamp: '4 hours ago' },
      { symbol: 'ADA/USDT', type: 'BUY', profit: -0.5, timestamp: '6 hours ago' },
    ]
  },
  {
    id: '2',
    traderName: 'Bitcoin Whale',
    traderId: '@btcwhale',
    winRate: 92.1,
    totalFollowers: 2850,
    monthlyReturn: 31.7,
    riskLevel: 'High',
    isFollowing: false,
    verified: true,
    rating: 4.9,
    recentTrades: [
      { symbol: 'BTC/USDT', type: 'BUY', profit: 5.2, timestamp: '1 hour ago' },
      { symbol: 'SOL/USDT', type: 'SELL', profit: 3.1, timestamp: '3 hours ago' },
    ]
  },
  {
    id: '3',
    traderName: 'DeFi Specialist',
    traderId: '@defispec',
    winRate: 79.3,
    totalFollowers: 890,
    monthlyReturn: 18.9,
    riskLevel: 'Low',
    isFollowing: false,
    verified: false,
    rating: 4.6,
    recentTrades: [
      { symbol: 'UNI/USDT', type: 'BUY', profit: 1.2, timestamp: '3 hours ago' },
      { symbol: 'LINK/USDT', type: 'BUY', profit: 2.7, timestamp: '5 hours ago' },
    ]
  }
];

export default function CopyTradingSignal() {
  const [signals, setSignals] = useState<CopyTradingSignal[]>(mockSignals);

  const toggleFollow = (signalId: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === signalId 
        ? { ...signal, isFollowing: !signal.isFollowing }
        : signal
    ));
    
    const signal = signals.find(s => s.id === signalId);
    if (signal) {
      toast.success(
        signal.isFollowing 
          ? `Stopped following ${signal.traderName}` 
          : `Now following ${signal.traderName}`
      );
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Copy Trading Signals
            </CardTitle>
            <CardDescription>
              Follow successful traders and copy their strategies automatically
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {signals.map((signal) => (
          <div key={signal.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {signal.traderName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{signal.traderName}</h4>
                    {signal.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{signal.traderId}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${
                          i < Math.floor(signal.rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({signal.rating})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={signal.isFollowing}
                  onCheckedChange={() => toggleFollow(signal.id)}
                />
                <span className="text-sm font-medium">
                  {signal.isFollowing ? 'Following' : 'Follow'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Win Rate</p>
                <p className="font-semibold text-green-600">{signal.winRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="font-semibold flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {signal.totalFollowers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Return</p>
                <p className="font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{signal.monthlyReturn}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Risk Level</p>
                <Badge className={getRiskColor(signal.riskLevel)}>
                  {signal.riskLevel}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Recent Trades</p>
              <div className="space-y-2">
                {signal.recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                        {trade.type}
                      </Badge>
                      <span className="font-medium">{trade.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit > 0 ? '+' : ''}{trade.profit}%
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {trade.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {signal.isFollowing && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🎯 You are copying this trader's signals. New trades will be executed automatically based on your risk settings.
                </p>
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" className="w-full">
          <Copy className="h-4 w-4 mr-2" />
          Discover More Traders
        </Button>
      </CardContent>
    </Card>
  );
}