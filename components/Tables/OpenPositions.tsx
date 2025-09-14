'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusDot from '@/components/ui/StatusDot';
import { cn } from '@/lib/utils';

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  status: 'open' | 'closed' | 'pending';
}

interface OpenPositionsProps {
  positions?: Position[];
  className?: string;
}

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    side: 'long',
    quantity: 0.5,
    entryPrice: 45000,
    markPrice: 46500,
    pnl: 750,
    status: 'open'
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    side: 'short',
    quantity: 2.0,
    entryPrice: 3200,
    markPrice: 3150,
    pnl: 100,
    status: 'open'
  },
  {
    id: '3',
    symbol: 'SOL/USDT',
    side: 'long',
    quantity: 10,
    entryPrice: 95,
    markPrice: 98,
    pnl: 30,
    status: 'open'
  }
];

export default function OpenPositions({ 
  positions = mockPositions, 
  className 
}: OpenPositionsProps) {
  const getStatusColor = (status: Position['status']) => {
    switch (status) {
      case 'open': return 'success';
      case 'closed': return 'neutral';
      case 'pending': return 'warning';
      default: return 'neutral';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPnl = (pnl: number) => {
    const isPositive = pnl >= 0;
    return (
      <span className={cn(
        "font-medium",
        isPositive ? "text-green-400" : "text-red-400"
      )}>
        {isPositive ? '+' : ''}{formatCurrency(pnl)}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinborder">
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Symbol</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Side</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Quantity</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Entry</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Mark</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">P&L</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-white/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr 
                  key={position.id} 
                  className="border-b border-zinborder hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-2 text-white font-medium">{position.symbol}</td>
                  <td className="py-3 px-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      position.side === 'long' 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {position.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-white">{position.quantity}</td>
                  <td className="py-3 px-2 text-white">{formatCurrency(position.entryPrice)}</td>
                  <td className="py-3 px-2 text-white">{formatCurrency(position.markPrice)}</td>
                  <td className="py-3 px-2">{formatPnl(position.pnl)}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <StatusDot status={getStatusColor(position.status)} size="sm" />
                      <span className="text-sm text-white/70 capitalize">{position.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
