'use client';

import { useState } from 'react';
import { EnhancedBackgroundAnimation } from '@/components/animations/EnhancedBackgroundAnimation';
import { PriceTickerAnimation } from '@/components/animations/PriceTickerAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function BackgroundAnimationDemo() {
  const [variant, setVariant] = useState<'crypto' | 'tech' | 'combined'>('combined');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Animation */}
      <EnhancedBackgroundAnimation variant={variant} intensity={intensity} />
      
      {/* Price Ticker */}
      <PriceTickerAnimation />
      
      {/* Demo Controls */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10">
              Background Animation Demo
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Enhanced Crypto & Tech Background Animations
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Interactive background animations featuring floating crypto symbols, circuit patterns, 
              data streams, and blockchain network visualizations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Variant Controls */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Animation Variant</CardTitle>
                <CardDescription>Choose the type of background animation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(['crypto', 'tech', 'combined'] as const).map((v) => (
                    <Button
                      key={v}
                      variant={variant === v ? 'default' : 'outline'}
                      onClick={() => setVariant(v)}
                      className="capitalize"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intensity Controls */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Animation Intensity</CardTitle>
                <CardDescription>Adjust the opacity and visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high'] as const).map((i) => (
                    <Button
                      key={i}
                      variant={intensity === i ? 'default' : 'outline'}
                      onClick={() => setIntensity(i)}
                      className="capitalize"
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Showcase */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Crypto Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Floating Bitcoin, Ethereum, and other cryptocurrency symbols with glow effects
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Tech Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Circuit board patterns, network connections, and geometric shapes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Data Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Animated data flow lines and particle systems representing live trading data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Price Ticker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Live updating price ticker with trend indicators and smooth transitions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Pulse Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Radial pulse animations and glow effects for enhanced visual appeal
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  GPU-accelerated animations optimized for smooth 60fps performance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}