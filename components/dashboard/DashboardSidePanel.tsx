'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import MarketOverview from './MarketOverview';
import AdvancedTradingAnalysis from './AdvancedTradingAnalysis';

export default function DashboardSidePanel() {
  return (
    <div className="w-full h-full glass-sidebar border-l border-border/50">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8">
          <MarketOverview />
          <Separator className="my-8 opacity-30" />
          <AdvancedTradingAnalysis />
        </div>
      </ScrollArea>
    </div>
  );
}