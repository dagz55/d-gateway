'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import MarketOverview from './MarketOverview';
import AdvancedTradingAnalysis from './AdvancedTradingAnalysis';

export default function DashboardSidePanel() {
  return (
    <div className="w-full h-full glass border-l border-border">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8">
          <MarketOverview />
          <Separator className="my-8" />
          <AdvancedTradingAnalysis />
        </div>
      </ScrollArea>
    </div>
  );
}