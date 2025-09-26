'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bitcoin, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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

const statsData = [
  {
    title: '24h Volume',
    value: '61.2B',
    icon: BarChart3,
    color: 'text-blue-400'
  },
  {
    title: '24h High',
    value: '$110.3K',
    icon: TrendingUp,
    color: 'text-green-400'
  },
  {
    title: '24h Low',
    value: '$108.8K',
    icon: TrendingDown,
    color: 'text-red-400'
  },
  {
    title: 'Market Cap',
    value: '2188.8B',
    icon: Activity,
    color: 'text-accent'
  }
];

function StatCard({ stat }: { stat: typeof statsData[0] }) {
  const Icon = stat.icon;
  
  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
          <Icon className={`w-8 h-8 ${stat.color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvancedTradingAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Advanced trading analysis</h2>
        <p className="text-muted-foreground">
          Track structure, momentum, and liquidity from a single interactive canvas built for actionable decisions.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <Bitcoin size={16} className="text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Bitcoin</span>
                  <Badge variant="outline" className="text-xs">BTC/USD</Badge>
                  <Badge className="text-xs bg-green-600">LIVE</Badge>
                  <span className="text-sm text-muted-foreground">CoinGecko</span>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-bold">$109.8K</span>
                  <span className="text-sm text-muted-foreground">~ 0.07%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="1h">
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
              <Button variant="outline" size="sm">Candles</Button>
              <Button variant="outline" size="sm">Line</Button>
              <Button variant="outline" size="sm">Area</Button>
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground">Live</Button>
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
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <TrendingUp size={16} className="mr-2" />
          Buy BTC
        </Button>
        <Button variant="destructive">
          <TrendingDown size={16} className="mr-2" />
          Sell BTC
        </Button>
        <Button variant="outline">
          <Activity size={16} className="mr-2" />
          Set Alert
        </Button>
        <Button variant="outline">
          <BarChart3 size={16} className="mr-2" />
          Analysis
        </Button>
      </div>
    </div>
  );
}