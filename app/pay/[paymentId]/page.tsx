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
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'completed' | 'failed';
  paymentLink: string;
  paypalOrderId?: string;
  transactionDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/payments/paypal/get-payment?paymentId=${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const data = await response.json();
      setPaymentData(data);
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalApprove = async (data: any, actions: any) => {
    setPaymentStatus('processing');

    try {
      const order = await actions.order.capture();
      
      // Update payment status
      const response = await fetch('/api/payments/paypal/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          status: 'completed',
          paypalOrderId: order.id,
          transactionDetails: order,
        }),
      });

      if (response.ok) {
        setPaymentStatus('success');
        toast.success('Payment completed successfully!');
        // Refresh payment data
        await fetchPaymentData();
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Payment failed. Please try again.');
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    setPaymentStatus('error');
    toast.error('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground">Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-muted-foreground text-center">
              {error || 'The payment link you are looking for does not exist or has expired.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentCompleted = paymentData.status === 'completed';
  const isPaymentFailed = paymentData.status === 'failed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <DollarSign className="h-6 w-6 text-accent" />
              Payment Request
            </CardTitle>
            <CardDescription>
              Complete your payment using PayPal
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Payment Status */}
            <div className="text-center">
              {isPaymentCompleted ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Payment Completed</span>
                </div>
              ) : isPaymentFailed ? (
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Payment Failed</span>
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  Pending Payment
                </Badge>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-card/30 rounded-lg p-6 border border-border/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Amount
                    </Label>
                    <p className="text-2xl font-bold text-accent">
                      ${paymentData.amount} {paymentData.currency}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </Label>
                    <p className="font-medium">{paymentData.customerName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{paymentData.customerEmail}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created
                    </Label>
                    <p className="font-medium">
                      {new Date(paymentData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </Label>
                <p className="font-medium mt-1">{paymentData.description}</p>
              </div>
            </div>

            {/* PayPal Payment Button */}
            {!isPaymentCompleted && !isPaymentFailed && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Complete Payment with PayPal</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure payment processing powered by PayPal
                  </p>
                </div>

                <div className="bg-card/30 rounded-lg p-4 border border-border/20">
                  <PayPalScriptProvider 
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb',
                      currency: paymentData.currency,
                      intent: 'capture',
                    }}
                  >
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
                        label: 'paypal',
                      }}
                    />
                  </PayPalScriptProvider>
                </div>

                {/* Payment Status */}
                {paymentStatus === 'processing' && (
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing payment...
                  </div>
                )}

                {paymentStatus === 'error' && (
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Payment failed. Please try again.
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {isPaymentCompleted && (
              <div className="text-center space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-400 mb-2">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment has been processed successfully. You will receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Failed Message */}
            {isPaymentFailed && (
              <div className="text-center space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-400 mb-2">Payment Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    There was an issue processing your payment. Please try again or contact support.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for labels
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
