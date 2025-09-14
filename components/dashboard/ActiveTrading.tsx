'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Timer,
  Target,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface ActiveTrade {
  id: string;
  pair: string;
  action: 'BUY' | 'SELL';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  profit: number;
  profitPercentage: number;
  duration: string;
  startTime: string;
  endTime: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  targetPrice?: number;
  stopLoss?: number;
}

const mockActiveTrades: ActiveTrade[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    action: 'BUY',
    amount: 1000,
    entryPrice: 46500,
    currentPrice: 47200,
    profit: 15.05,
    profitPercentage: 1.5,
    duration: '2h 15m',
    startTime: '2024-01-15 12:30:00',
    endTime: '2024-01-15 18:30:00',
    progress: 37.5,
    status: 'active',
    targetPrice: 48000,
    stopLoss: 45000
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    action: 'BUY',
    amount: 500,
    entryPrice: 3150,
    currentPrice: 3180,
    profit: 4.76,
    profitPercentage: 0.95,
    duration: '45m',
    startTime: '2024-01-15 14:15:00',
    endTime: '2024-01-15 16:15:00',
    progress: 75,
    status: 'active',
    targetPrice: 3250,
    stopLoss: 3100
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    action: 'SELL',
    amount: 2000,
    entryPrice: 98.5,
    currentPrice: 96.2,
    profit: 46.7,
    profitPercentage: 2.34,
    duration: '1h 30m',
    startTime: '2024-01-15 10:45:00',
    endTime: '2024-01-15 14:45:00',
    progress: 62.5,
    status: 'active',
    targetPrice: 95.0,
    stopLoss: 100.0
  }
];

export default function ActiveTrading() {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const totalActiveAmount = mockActiveTrades
    .filter(trade => trade.status === 'active')
    .reduce((sum, trade) => sum + trade.amount, 0);

  const totalProfit = mockActiveTrades
    .filter(trade => trade.status === 'active')
    .reduce((sum, trade) => sum + trade.profit, 0);

  const activeTradesCount = mockActiveTrades.filter(trade => trade.status === 'active').length;

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Active Trading
        </CardTitle>
        <CardDescription>
          Trading details: date, time, purchase amount, and trading duration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Active Trades</span>
            </div>
            <div className="text-xl font-bold text-blue-400">{activeTradesCount}</div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Total Amount</span>
            </div>
            <div className="text-xl font-bold text-green-400">${totalActiveAmount.toFixed(2)}</div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Live Profit</span>
            </div>
            <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Active Trades List */}
        <div className="space-y-4">
          {mockActiveTrades.filter(trade => trade.status === 'active').map((trade) => (
            <div
              key={trade.id}
              className={`bg-card/30 rounded-lg p-4 border border-border/20 hover:border-border/40 transition-all duration-200 cursor-pointer ${
                selectedTrade === trade.id ? 'ring-2 ring-accent/50' : ''
              }`}
              onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)}
            >
              <div className="space-y-4">
                {/* Trade Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.action === 'BUY' ? 'default' : 'secondary'}>
                      {trade.action}
                    </Badge>
                    <span className="font-semibold text-foreground">{trade.pair}</span>
                    <Badge variant="outline" className="text-xs">
                      {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </div>
                    <div className={`text-sm ${trade.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profitPercentage >= 0 ? '+' : ''}{trade.profitPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">${trade.amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entry Price</div>
                    <div className="font-medium">${trade.entryPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Price</div>
                    <div className="font-medium">${trade.currentPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {trade.duration}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Trade Progress</span>
                    <span>{trade.progress}%</span>
                  </div>
                  <Progress value={trade.progress} className="h-2" />
                </div>

                {/* Expanded Details */}
                {selectedTrade === trade.id && (
                  <div className="border-t border-border/30 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Start Time</div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {trade.startTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">End Time</div>
                        <div className="font-medium flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {trade.endTime}
                        </div>
                      </div>
                    </div>

                    {trade.targetPrice && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Target Price</div>
                          <div className="font-medium flex items-center gap-1 text-green-400">
                            <Target className="h-3 w-3" />
                            ${trade.targetPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Stop Loss</div>
                          <div className="font-medium flex items-center gap-1 text-red-400">
                            <Target className="h-3 w-3" />
                            ${trade.stopLoss?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Close Trade
                      </Button>
                      <Button size="sm" variant="outline">
                        Modify
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeTradesCount === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active trades at the moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a new trade or copy from available signals
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
