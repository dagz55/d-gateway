'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useState } from 'react';

interface TradingHistoryEntry {
  id: string;
  date: string;
  time: string;
  amount: number;
  profit: number;
  profitPercentage: number;
  pair: string;
  action: 'BUY' | 'SELL';
  status: 'completed' | 'pending' | 'failed';
}

// Trading history will be loaded from the database
const historyData: TradingHistoryEntry[] = [];

export default function ZigTradingHistory() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterAction, setFilterAction] = useState<'all' | 'BUY' | 'SELL'>('all');

  const filteredData = historyData.filter(entry => {
    const statusMatch = filterStatus === 'all' || entry.status === filterStatus;
    const actionMatch = filterAction === 'all' || entry.action === filterAction;
    return statusMatch && actionMatch;
  });

  const totalProfit = historyData
    .filter(entry => entry.status === 'completed')
    .reduce((sum, entry) => sum + entry.profit, 0);

  const totalAmount = historyData
    .filter(entry => entry.status === 'completed')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const winRate = historyData.length > 0 ? (historyData.filter(entry => entry.profit > 0).length / historyData.length * 100) : 0;

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          Trading History
        </CardTitle>
        <CardDescription>
          Date, time and amount of all your trading activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Total Profit</span>
            </div>
            <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalProfit.toFixed(2)}
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Win Rate</span>
            </div>
            <div className="text-xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">${totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All Status
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('failed')}
          >
            Failed
          </Button>
          <Button
            variant={filterAction === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('all')}
          >
            All Actions
          </Button>
          <Button
            variant={filterAction === 'BUY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('BUY')}
          >
            BUY
          </Button>
          <Button
            variant={filterAction === 'SELL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('SELL')}
          >
            SELL
          </Button>
        </div>

        {/* History Table */}
        <div className="space-y-3">
          {filteredData.map((entry) => (
            <div
              key={entry.id}
              className="bg-card/30 rounded-lg p-4 border border-border/20 hover:border-border/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.time}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{entry.pair}</div>
                    <div className="text-xs text-muted-foreground">Trading Pair</div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">${entry.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                  </div>

                  <div className="text-left">
                    <Badge variant={entry.action === 'BUY' ? 'default' : 'secondary'}>
                      {entry.action}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${entry.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.profit >= 0 ? '+' : ''}${entry.profit.toFixed(2)}
                    </div>
                    <div className={`text-xs ${entry.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.profitPercentage >= 0 ? '+' : ''}{entry.profitPercentage.toFixed(1)}%
                    </div>
                  </div>

                  <Badge
                    variant={
                      entry.status === 'completed'
                        ? 'default'
                        : entry.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {historyData.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trading history available</p>
            <p className="text-sm text-muted-foreground mt-2">Your trading history will appear here once you start trading.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trading history found with current filters</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
