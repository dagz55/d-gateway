'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface PortfolioAsset {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  change24h: number;
  amount: number;
  color: string;
}

// TODO: Replace with real portfolio data from Supabase
// This should fetch from user's actual holdings from trades/positions table
const portfolioData: PortfolioAsset[] = [];

export default function PortfolioDistributionChart() {
  const [view, setView] = useState<'chart' | 'list'>('chart');
  
  const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange24h = portfolioData.reduce((sum, asset) => {
    const change = (asset.value * asset.change24h) / 100;
    return sum + change;
  }, 0);
  const totalChange24hPercentage = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold">{data.name} ({data.symbol})</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-semibold">${data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-semibold">{data.percentage}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">24h Change:</span>
              <span className={`font-semibold ${data.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Portfolio Distribution
            </CardTitle>
            <CardDescription>
              Your cryptocurrency asset allocation and performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('chart')}
            >
              Chart
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">24h Change</span>
            </div>
            <p className={`text-2xl font-bold ${totalChange24hPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange24hPercentage >= 0 ? '+' : ''}{totalChange24hPercentage.toFixed(2)}%
            </p>
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">24h P&L</span>
            </div>
            <p className={`text-2xl font-bold ${totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange24h >= 0 ? '+' : ''}${totalChange24h.toFixed(2)}
            </p>
          </div>
        </div>

        {view === 'chart' ? (
          /* Pie Chart View */
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Asset Breakdown</h4>
              {portfolioData.length > 0 ? portfolioData.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: asset.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{asset.percentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      ${asset.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No portfolio data available</p>
                  <p className="text-xs mt-1">Start trading to see your portfolio distribution</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {portfolioData.length > 0 ? portfolioData.map((asset) => (
              <div key={asset.symbol} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.symbol.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{asset.name}</h4>
                      <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${asset.value.toLocaleString()}</p>
                    <Badge variant={asset.change24h >= 0 ? "default" : "destructive"}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Holdings</span>
                    <span>{asset.amount} {asset.symbol}</span>
                  </div>
                  <Progress value={asset.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{asset.percentage}% of portfolio</span>
                    <span>Allocation target: {asset.percentage}%</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-12 border rounded-lg border-dashed">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No Portfolio Data</p>
                <p className="text-sm mt-1 mb-4">Your portfolio is empty. Start by making your first trade.</p>
                <Button variant="outline" size="sm">
                  View Trading Signals
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            Rebalance Portfolio
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Add Asset
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}