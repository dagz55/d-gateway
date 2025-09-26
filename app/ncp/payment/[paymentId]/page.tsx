'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, DollarSign, User, Mail, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'completed' | 'failed';
  payment_link: string;
  created_at: string;
}

export default function NCPPaymentPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`/api/payments/paypal/get-payment?paymentId=${paymentId}`);
        const data = await response.json();
        
        if (data.success) {
          setPaymentData(data.payment);
        } else {
          setError(data.error || 'Payment not found');
        }
      } catch (err) {
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture();
      
      // Update payment status
      const response = await fetch('/api/payments/paypal/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          status: 'completed',
          paypalOrderId: order.id,
          paypalTransactionId: order.purchase_units[0].payments.captures[0].id
        })
      });

      if (response.ok) {
        toast.success('Payment completed successfully!');
        setPaymentData(prev => prev ? { ...prev, status: 'completed' } : null);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    toast.error('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Payment Not Found</CardTitle>
            <CardDescription>
              {error || 'The payment link you are looking for does not exist or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: paymentData.currency,
    intent: 'capture',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zignals Payment</h1>
          <p className="text-gray-600">Complete your payment securely with PayPal</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">
                  {paymentData.currency} {paymentData.amount}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge 
                  variant={paymentData.status === 'completed' ? 'default' : 
                          paymentData.status === 'failed' ? 'destructive' : 'secondary'}
                >
                  {paymentData.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium">{paymentData.description}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm">
                  {new Date(paymentData.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{paymentData.customer_name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{paymentData.customer_email}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PayPal Payment */}
        {paymentData.status === 'pending' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Click the PayPal button below to complete your payment securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [
                        {
                          amount: {
                            value: paymentData.amount.toString(),
                            currency_code: paymentData.currency,
                          },
                          description: paymentData.description,
                        },
                      ],
                    });
                  }}
                  onApprove={handlePayPalApprove}
                  onError={handlePayPalError}
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                />
              </PayPalScriptProvider>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {paymentData.status === 'completed' && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Payment Completed Successfully!</h3>
                  <p className="text-sm text-green-600">
                    Thank you for your payment. You will receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}