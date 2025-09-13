'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignals } from '@/hooks/api/useSignals';
import { Signal } from '@/types';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SignalsListProps {
  limit?: number;
}

export default function SignalsList({ limit }: SignalsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data, isLoading, error } = useSignals({ limit });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copySignal = async (signal: Signal) => {
    const signalText = `${signal.pair} ${signal.action} - Entry: ${formatCurrency(signal.entry)}, SL: ${formatCurrency(signal.sl)}, TP: ${signal.tp.map((tp: number) => formatCurrency(tp)).join(', ')}`;
    
    try {
      await navigator.clipboard.writeText(signalText);
      setCopiedId(signal.id);
      toast.success('Signal copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy signal');
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load signals. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Signals</CardTitle>
        <CardDescription>
          {limit ? `Latest ${limit} signals` : 'Active trading signals'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(limit || 3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-2"></div>
                <div className="h-3 w-48 bg-muted rounded mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No signals available
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((signal) => (
              <div key={signal.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{signal.pair}</h4>
                    <Badge
                      variant={signal.action === 'BUY' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {signal.action}
                    </Badge>
                    {signal.status && (
                      <Badge variant="outline" className="text-xs">
                        {signal.status}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copySignal(signal)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === signal.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entry:</span>
                    <div className="font-medium">{formatCurrency(signal.entry)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <div className="font-medium text-red-600">{formatCurrency(signal.sl)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Take Profit:</span>
                    <div className="font-medium text-green-600">
                      {signal.tp.map((tp, index) => (
                        <span key={index}>
                          {formatCurrency(tp)}
                          {index < signal.tp.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued:</span>
                    <div className="font-medium">{formatDate(signal.issuedAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
