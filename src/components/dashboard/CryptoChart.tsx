'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCryptoPrices } from '@/hooks/api/useCryptoPrices';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


export default function CryptoChart() {
  const { data, isLoading, refetch } = useCryptoPrices();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BTC/USDT Price Chart</CardTitle>
          <CardDescription>Loading price data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>BTC/USDT Price Chart</CardTitle>
          <CardDescription>Last 7 days price movement</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data || []}>
              <XAxis 
                dataKey="t" 
                hide 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
