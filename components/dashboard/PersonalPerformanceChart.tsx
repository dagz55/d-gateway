'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PerformanceData {
  date: string;
  balance: number;
  profit: number;
  trades: number;
}

// TODO: Replace with real performance data from Supabase
// This should fetch from user's trading history and calculate performance over time
const getPerformanceData = async (period: string): Promise<PerformanceData[]> => {
  // In a real implementation, this would:
  // 1. Fetch user's trades from Supabase for the specified period
  // 2. Calculate daily balance changes based on trade P&L
  // 3. Return actual performance data
  return [];
};

export default function PersonalPerformanceChart() {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date().toLocaleString());
    
    // TODO: Fetch real performance data
    // getPerformanceData(timePeriod).then(setData);
  }, [timePeriod]);
  
  const [data, setData] = useState<PerformanceData[]>([]);
  
  const currentBalance = data[data.length - 1]?.balance || 0;
  const initialBalance = data[0]?.balance || 0;
  const totalProfit = currentBalance - initialBalance;
  const totalProfitPercentage = initialBalance > 0 ? ((totalProfit / initialBalance) * 100) : 0;
  const isProfit = totalProfit >= 0;

  const stats = {
    totalTrades: data.reduce((sum, day) => sum + day.trades, 0),
    avgDailyProfit: data.length > 0 ? Math.round((totalProfit / data.length) * 100) / 100 : 0,
    bestDay: data.length > 0 ? Math.max(...data.map(d => d.profit)) : 0,
    worstDay: data.length > 0 ? Math.min(...data.map(d => d.profit)) : 0,
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Trading Performance
              </CardTitle>
              <CardDescription>
                Track your personal trading journey and portfolio growth
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="90d">90D</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-lg font-bold">$---</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className="text-lg font-bold">$---</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Return</p>
              <p className="text-lg font-bold">--%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-lg font-bold">--</p>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Trading Performance
            </CardTitle>
            <CardDescription>
              Track your personal trading journey and portfolio growth
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-lg font-bold">${currentBalance.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <div className="flex items-center justify-center gap-1">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {isProfit ? '+' : ''}${totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Return</p>
            <p className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}{totalProfitPercentage.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-lg font-bold">{stats.totalTrades}</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="h-80">
          {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isProfit ? "#10b981" : "#ef4444"} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isProfit ? "#10b981" : "#ef4444"} 
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [
                  name === 'balance' 
                    ? `$${Number(value).toLocaleString()}` 
                    : `${Number(value) > 0 ? '+' : ''}$${Number(value).toFixed(2)}`,
                  name === 'balance' ? 'Portfolio Value' : 'Daily P&L'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={isProfit ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No Performance Data</p>
                <p className="text-sm text-muted-foreground mt-1">Start trading to track your performance</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Avg Daily P&L</p>
            <p className={`text-sm font-semibold ${stats.avgDailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.avgDailyProfit >= 0 ? '+' : ''}${stats.avgDailyProfit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Best Day</p>
            <p className="text-sm font-semibold text-green-600">
              +${stats.bestDay.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Worst Day</p>
            <p className="text-sm font-semibold text-red-600">
              ${stats.worstDay.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-sm font-semibold">
              {Math.round((data.filter(d => d.profit > 0).length / data.length) * 100)}%
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant={isProfit ? "default" : "destructive"}>
              {isProfit ? "Profitable" : "Loss Period"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}