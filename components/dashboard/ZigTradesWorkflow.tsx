'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, History, Activity } from 'lucide-react';
import TradingSignals from './TradingSignals';
import ZigTradingHistory from './ZigTradingHistory';
import ActiveTrading from './ActiveTrading';

export default function ZigTradesWorkflow() {
  return (
    <Card className="glass-admin glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 admin-gradient-text">
          <Target className="h-6 w-6 text-accent" />
          ZIG TRADES
        </CardTitle>
        <CardDescription>
          Complete trading workflow with signals, history, and active trading management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Trading Signals
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Trading History
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="mt-0">
            <TradingSignals />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ZigTradingHistory />
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            <ActiveTrading />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
