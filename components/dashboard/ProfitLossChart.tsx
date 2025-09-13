'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Award, BarChart3, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ProfitLossData {
  date: string;
  profit: number;
  loss: number;
  net: number;
  trades: number;
  winRate: number;
}

interface TradeAnalysis {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

const generatePnLData = (period: string, seed: number = 67890): ProfitLossData[] => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const data: ProfitLossData[] = [];
  
  // Use seeded random for consistent data
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const trades = Math.floor(seededRandom() * 12) + 3;
    const winRate = 0.55 + (seededRandom() - 0.5) * 0.3; // 40-70% win rate
    const winningTrades = Math.floor(trades * winRate);
    const losingTrades = trades - winningTrades;
    
    const avgWin = 50 + seededRandom() * 100;
    const avgLoss = 30 + seededRandom() * 60;
    
    const profit = winningTrades * avgWin;
    const loss = losingTrades * avgLoss;
    const net = profit - loss;
    
    data.push({
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(period === '1y' && { year: '2-digit' })
      }),
      profit: Math.round(profit),
      loss: Math.round(loss),
      net: Math.round(net),
      trades,
      winRate: Math.round(winRate * 100),
    });
  }
  
  return data;
};

const calculateAnalysis = (data: ProfitLossData[]): TradeAnalysis => {
  const totalTrades = data.reduce((sum, day) => sum + day.trades, 0);
  const totalProfit = data.reduce((sum, day) => sum + day.profit, 0);
  const totalLoss = data.reduce((sum, day) => sum + day.loss, 0);
  const netProfit = totalProfit - totalLoss;
  const winningDays = data.filter(day => day.net > 0).length;
  const winRate = (winningDays / data.length) * 100;
  const avgWin = totalProfit / Math.max(winningDays, 1);
  const avgLoss = totalLoss / Math.max((data.length - winningDays), 1);
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
  
  return {
    totalTrades,
    winningTrades: winningDays,
    losingTrades: data.length - winningDays,
    totalProfit,
    totalLoss,
    netProfit,
    winRate,
    avgWin,
    avgLoss,
    profitFactor
  };
};

export default function ProfitLossChart() {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [chartType, setChartType] = useState<'daily' | 'cumulative'>('daily');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const data = isClient ? generatePnLData(timePeriod) : [];
  const analysis = data.length > 0 ? calculateAnalysis(data) : {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
  };
  
  // Calculate cumulative data
  const cumulativeData = data.map((item, index) => {
    const cumulativeNet = data.slice(0, index + 1).reduce((sum, d) => sum + d.net, 0);
    return { ...item, cumulativeNet };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold">
                ${Math.abs(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getRiskLevel = (profitFactor: number) => {
    if (profitFactor >= 2) return { level: 'Low Risk', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
    if (profitFactor >= 1.5) return { level: 'Medium Risk', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
    return { level: 'High Risk', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
  };

  const riskAssessment = getRiskLevel(analysis.profitFactor);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Profit & Loss Analysis
          </CardTitle>
          <CardDescription>
            Track your trading performance and profitability metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading P&L data...</p>
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
              <BarChart3 className="h-5 w-5" />
              Profit & Loss Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your trading performance and risk metrics
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
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Net P&L</span>
            </div>
            <p className={`text-lg font-bold ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysis.netProfit >= 0 ? '+' : ''}${analysis.netProfit.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Win Rate</span>
            </div>
            <p className="text-lg font-bold">{analysis.winRate.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Profit Factor</span>
            </div>
            <p className="text-lg font-bold">{analysis.profitFactor.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Risk Level</span>
            </div>
            <Badge className={riskAssessment.color}>
              {riskAssessment.level}
            </Badge>
          </div>
        </div>

        {/* Chart Tabs */}
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'daily' | 'cumulative')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily P&L</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative P&L</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="profit" 
                    fill="#10b981" 
                    name="Profit"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="loss" 
                    fill="#ef4444" 
                    name="Loss"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="cumulative" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cumulative P&L']}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeNet"
                    stroke={analysis.netProfit >= 0 ? "#10b981" : "#ef4444"}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-3">
            <h4 className="font-semibold">Trade Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Trades:</span>
                <span className="font-semibold">{analysis.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winning Trades:</span>
                <span className="font-semibold text-green-600">{analysis.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Losing Trades:</span>
                <span className="font-semibold text-red-600">{analysis.losingTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Win:</span>
                <span className="font-semibold text-green-600">${analysis.avgWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Loss:</span>
                <span className="font-semibold text-red-600">${analysis.avgLoss.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Performance Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Profits:</span>
                <span className="font-semibold text-green-600">${analysis.totalProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Losses:</span>
                <span className="font-semibold text-red-600">${analysis.totalLoss.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Result:</span>
                <span className={`font-semibold ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.netProfit >= 0 ? '+' : ''}${analysis.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk/Reward Ratio:</span>
                <span className="font-semibold">
                  1:{(analysis.avgWin / Math.max(analysis.avgLoss, 1)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimize Strategy
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}