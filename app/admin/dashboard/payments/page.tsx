'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import PayPalPaymentLink from '@/components/payments/PayPalPaymentLink';
import PayPalPaymentsManager from '@/components/admin/PayPalPaymentsManager';

export default function AdminPaymentsPage() {
  return (
    <div className="admin-dashboard space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          PayPal <span className="text-orange-400">Payments</span>
        </h1>
        <p className="text-gray-300">
          Manage PayPal payment links and monitor transactions
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 bg-transparent border border-border/50 text-gray-300 px-4 py-2 rounded-lg">
          <Plus className="h-4 w-4" />
          Create Payment Link
        </div>
        <div className="flex items-center gap-2 bg-transparent border border-border/50 text-gray-300 px-4 py-2 rounded-lg">
          <CreditCard className="h-4 w-4" />
          Manage Payments
        </div>
      </div>

      {/* PayPal Payment Link Generator */}
      <PayPalPaymentLink 
        onPaymentSuccess={(paymentData) => {
          console.log('Payment completed:', paymentData);
        }}
        onPaymentError={(error) => {
          console.error('Payment error:', error);
        }}
      />

      {/* PayPal Payments Manager */}
      <PayPalPaymentsManager />
    </div>
  );
}
