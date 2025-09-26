'use client';

import { Suspense } from 'react';
import PayPalPaymentsManager from '@/components/admin/PayPalPaymentsManager';
import PayPalPaymentLink from '@/components/payments/PayPalPaymentLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Plus } from 'lucide-react';

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8 p-6 dashboard-bg min-h-screen">
      {/* Enhanced backdrop with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20 pointer-events-none" />

      {/* Main content with proper z-index */}
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white gradient-text">
              PayPal Payments
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage PayPal payment links and monitor transactions
            </p>
          </div>
        </div>

        {/* Tabs for different payment functions */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Payment Link
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Manage Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="glass glass-hover card-glow-hover border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-accent" />
                  Create New Payment Link
                </CardTitle>
                <CardDescription>
                  Generate a secure PayPal payment link for your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  </div>
                }>
                  <PayPalPaymentLink />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Suspense fallback={
              <Card className="glass glass-hover card-glow-hover border-border/50">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </CardContent>
              </Card>
            }>
              <PayPalPaymentsManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
