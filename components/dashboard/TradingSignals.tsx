'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { useState } from 'react';

interface ZignalOffer {
  id: string;
  title: string;
  description: string;
  dailyProfit: string;
  duration: string;
  minAmount: string;
  status: 'active' | 'inactive';
  copyCount: number;
}

// Offers will be loaded from the database
const offers: ZignalOffer[] = [];

export default function TradingSignals() {
  const [copiedOffer, setCopiedOffer] = useState<string | null>(null);

  const handleCopyTrade = (offerId: string) => {
    setCopiedOffer(offerId);
    // Simulate copy trade action
    setTimeout(() => {
      setCopiedOffer(null);
    }, 2000);
  };

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Trading Signals
        </CardTitle>
        <CardDescription>
          Professional trading signals with copy trading capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {offers.length > 0 ? offers.map((offer, index) => (
          <div key={offer.id} className="space-y-4">
            {/* Offer Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{offer.title}</h3>
                <p className="text-sm text-muted-foreground">{offer.description}</p>
              </div>
              <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                {offer.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Offer Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Daily Profit</span>
                </div>
                <div className="text-xl font-bold text-green-400">{offer.dailyProfit}</div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>
                <div className="text-xl font-bold text-blue-400">{offer.duration}</div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Min. Amount</span>
                </div>
                <div className="text-xl font-bold text-yellow-400">${offer.minAmount}</div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Copy className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Copies</span>
                </div>
                <div className="text-xl font-bold text-accent">{offer.copyCount}</div>
              </div>
            </div>

            {/* Copy Trade Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => handleCopyTrade(offer.id)}
                disabled={offer.status !== 'active' || copiedOffer === offer.id}
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                size="lg"
              >
                {copiedOffer === offer.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Copying Trade...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    COPY TRADE
                  </>
                )}
              </Button>
            </div>

            {/* Separator between offers */}
            {index < offers.length - 1 && (
              <div className="border-t border-border/30 pt-6">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-8">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trading signals available</p>
            <p className="text-sm text-muted-foreground mt-2">Professional trading signals will appear here when available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
