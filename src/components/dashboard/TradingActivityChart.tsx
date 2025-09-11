'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Calendar, Clock, Mouse, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ActivityData {
  hour: string;
  trades: number;
  volume: number;
  success: number;
}

interface DayOfWeekData {
  day: string;
  trades: number;
  avgProfit: number;
  winRate: number;
}

interface AssetActivityData {
  asset: string;
  trades: number;
  volume: number;
  profit: number;
  color: string;
}

const generateHourlyData = (seed: number = 12345): ActivityData[] => {
  const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
  
  // Use seeded random for consistent data
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  return hours.map(hour => ({
    hour: `${hour}:00`,
    trades: Math.floor(seededRandom() * 15) + 2,
    volume: Math.floor(seededRandom() * 50000) + 5000,
    success: Math.floor(seededRandom() * 80) + 40,
  }));
};

const generateWeeklyData = (seed: number = 54321): DayOfWeekData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Use seeded random for consistent data
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  return days.map(day => ({
    day,
    trades: Math.floor(seededRandom() * 25) + 5,
    avgProfit: Math.floor(seededRandom() * 200) - 50,
    winRate: Math.floor(seededRandom() * 40) + 50,
  }));
};

const generateAssetActivity = (): AssetActivityData[] => {
  return [
    { asset: 'BTC/USDT', trades: 45, volume: 125000, profit: 2350, color: '#f7931a' },
    { asset: 'ETH/USDT', trades: 38, volume: 89000, profit: 1890, color: '#627eea' },
    { asset: 'ADA/USDT', trades: 22, volume: 34000, profit: 780, color: '#0033ad' },
    { asset: 'SOL/USDT', trades: 18, volume: 28000, profit: 1200, color: '#9945ff' },
    { asset: 'DOT/USDT', trades: 15, volume: 22000, profit: -320, color: '#e6007a' },
  ];
};

export default function TradingActivityChart() {
  const [timePeriod, setTimePeriod] = useState('7d');
  const [view, setView] = useState<'hourly' | 'weekly' | 'assets'>('hourly');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const hourlyData = isClient ? generateHourlyData() : [];
  const weeklyData = isClient ? generateWeeklyData() : [];
  const assetData = generateAssetActivity();

  const totalTrades = hourlyData.reduce((sum, h) => sum + h.trades, 0);
  const totalVolume = hourlyData.reduce((sum, h) => sum + h.volume, 0);
  const avgSuccessRate = hourlyData.reduce((sum, h) => sum + h.success, 0) / hourlyData.length;
  
  const peakHour = hourlyData.reduce((max, hour) => 
    hour.trades > max.trades ? hour : max, hourlyData[0]
  );

  const bestDay = weeklyData.reduce((best, day) => 
    day.avgProfit > best.avgProfit ? day : best, weeklyData[0]
  );

  const mostActiveAsset = assetData.reduce((most, asset) => 
    asset.trades > most.trades ? asset : most, assetData[0]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {view === 'hourly' && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Trades:</span>
                <span className="font-semibold">{data.trades}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Volume:</span>
                <span className="font-semibold">${data.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-semibold">{data.success}%</span>
              </div>
            </div>
          )}
          {view === 'weekly' && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Trades:</span>
                <span className="font-semibold">{data.trades}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Avg Profit:</span>
                <span className={`font-semibold ${data.avgProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.avgProfit >= 0 ? '+' : ''}${data.avgProfit}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Win Rate:</span>
                <span className="font-semibold">{data.winRate}%</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trading Activity
          </CardTitle>
          <CardDescription>
            Analyze your trading patterns and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading activity data...</p>
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
              <Activity className="h-5 w-5" />
              Trading Activity Analysis
            </CardTitle>
            <CardDescription>
              Analyze your trading patterns and optimize your strategy timing
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Mouse className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Trades</span>
            </div>
            <p className="text-lg font-bold">{totalTrades}</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Volume</span>
            </div>
            <p className="text-lg font-bold">${totalVolume.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Success</span>
            </div>
            <p className="text-lg font-bold">{avgSuccessRate.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Peak Hour</span>
            </div>
            <p className="text-lg font-bold">{peakHour.hour}</p>
          </div>
        </div>

        {/* Activity Charts */}
        <Tabs value={view} onValueChange={(value) => setView(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hourly">Hourly Activity</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Pattern</TabsTrigger>
            <TabsTrigger value="assets">Asset Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
                    {hourlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.trades === peakHour.trades ? '#10b981' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              💡 Your most active trading time is <strong>{peakHour.hour}</strong> with {peakHour.trades} trades
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.day === bestDay.day ? '#10b981' : '#8b5cf6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              📊 Your best performing day is <strong>{bestDay.day}</strong> with avg profit of ${bestDay.avgProfit}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="space-y-4">
              {assetData.map((asset, index) => (
                <div key={asset.asset} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <div>
                      <h4 className="font-semibold">{asset.asset}</h4>
                      <p className="text-sm text-muted-foreground">{asset.trades} trades</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={asset.profit >= 0 ? "default" : "destructive"}>
                        {asset.profit >= 0 ? '+' : ''}${asset.profit}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vol: ${asset.volume.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              🏆 Your most active pair is <strong>{mostActiveAsset.asset}</strong> with {mostActiveAsset.trades} trades
            </div>
          </TabsContent>
        </Tabs>

        {/* Insights Section */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity Insights
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="font-medium text-blue-700 dark:text-blue-300">Peak Performance</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  You trade most actively at {peakHour.hour} with {peakHour.trades} trades per session
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="font-medium text-green-700 dark:text-green-300">Best Day</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {bestDay.day} shows highest profitability with ${bestDay.avgProfit} average
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Optimization Tips
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="font-medium text-yellow-700 dark:text-yellow-300">Focus Hours</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Consider concentrating trades during your peak hours for better results
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="font-medium text-purple-700 dark:text-purple-300">Asset Diversification</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {mostActiveAsset.asset} dominates your activity - consider diversifying
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Alerts
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Activity className="h-4 w-4 mr-2" />
            Activity Report
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Optimize Timing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}