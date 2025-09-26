'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, CheckCircle, AlertCircle, DollarSign, User, Mail, FileText, Calendar,
  Shield, Clock, CreditCard, Globe, Smartphone, Monitor, Zap, Star,
  Copy, ExternalLink, Download, Share2, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_link: string;
  created_at: string;
  updated_at?: string;
  paypal_order_id?: string;
  paypal_transaction_id?: string;
  payment_method?: string;
  fees?: number;
  net_amount?: number;
  expiry_date?: string;
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    device_type?: string;
  };
}

export default function NCPPaymentPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'loading' | 'details' | 'payment' | 'processing' | 'complete'>('loading');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced data fetching with progress tracking
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setProgress(20);
        const response = await fetch(`/api/payments/paypal/get-payment?paymentId=${paymentId}`);
        setProgress(60);
        
        const data = await response.json();
        setProgress(80);
        
        if (data.success) {
          setPaymentData(data.payment);
          setPaymentStep('details');
          
          // Check if payment has expiry
          if (data.payment.expiry_date) {
            const expiry = new Date(data.payment.expiry_date).getTime();
            const now = Date.now();
            const remaining = Math.max(0, expiry - now);
            setTimeRemaining(remaining);
          }
        } else {
          setError(data.error || 'Payment not found');
          setPaymentStep('loading');
        }
      } catch (err) {
        setError('Failed to load payment details');
        setPaymentStep('loading');
      } finally {
        setProgress(100);
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  // Countdown timer for payment expiry
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1000) {
          setError('Payment link has expired');
          return 0;
        }
        return prev ? prev - 1000 : 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [!!timeRemaining]); // Only depend on whether timer should be active

  // Enhanced PayPal handlers with better UX
  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      setPaymentStep('processing');
      setProgress(30);
      
      const order = await actions.order.capture();
      setProgress(60);
      
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

      setProgress(90);
      
      if (response.ok) {
        toast.success('Payment completed successfully!', {
          description: 'You will receive a confirmation email shortly.',
          duration: 5000,
        });
        setPaymentData(prev => prev ? { 
          ...prev, 
          status: 'completed',
          paypal_order_id: order.id,
          paypal_transaction_id: order.purchase_units[0].payments.captures[0].id,
          updated_at: new Date().toISOString()
        } : null);
        setPaymentStep('complete');
        setProgress(100);
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      setPaymentStep('payment');
      setProgress(0);
      toast.error('Payment processing failed', {
        description: 'Please try again or contact support if the issue persists.',
        duration: 5000,
      });
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    setPaymentStep('payment');
    toast.error('Payment failed', {
      description: 'Please check your payment details and try again.',
      duration: 5000,
    });
  };

  // Utility functions
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <div className="w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment Details</h2>
          <p className="text-gray-800 font-medium mb-4">Please wait while we fetch your payment information...</p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
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
            <CardDescription className="text-gray-800">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with Security Badges */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Zignals Payment</h1>
                <p className="text-sm text-gray-600">Secure Payment Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                SSL Secured
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Lock className="h-4 w-4" />
                Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Payment Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              paymentStep === 'loading' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${paymentStep === 'loading' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              Loading
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              paymentStep === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${paymentStep === 'details' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              Details
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              paymentStep === 'payment' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${paymentStep === 'payment' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              Payment
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              paymentStep === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${paymentStep === 'complete' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
              Complete
            </div>
          </div>
        </div>

        {/* Time Remaining Alert */}
        {timeRemaining && timeRemaining > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-orange-800">
                <Clock className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Payment Link Expires Soon</h3>
                  <p className="text-sm">Time remaining: <span className="font-mono font-bold">{formatTimeRemaining(timeRemaining)}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Enhanced Payment Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-600"
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Payment Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-800 font-medium">Total Amount:</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {paymentData.currency} {paymentData.amount}
                  </span>
                </div>
                {paymentData.fees && (
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Processing Fee:</span>
                    <span>{paymentData.currency} {paymentData.fees}</span>
                  </div>
                )}
                {paymentData.net_amount && (
                  <div className="flex justify-between items-center text-sm font-medium text-gray-800">
                    <span>Net Amount:</span>
                    <span>{paymentData.currency} {paymentData.net_amount}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800 font-medium">Status:</span>
                    <Badge className={`${getStatusColor(paymentData.status)} border`}>
                      {paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800 font-medium">Payment ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-900">{paymentData.id.slice(0, 8)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentData.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800 font-medium">Created:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(paymentData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {paymentData.updated_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-800 font-medium">Updated:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(paymentData.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">Description:</h4>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{paymentData.description}</p>
              </div>

              {/* Advanced Details (Collapsible) */}
              {showDetails && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-800">Advanced Details</h4>
                  
                  {paymentData.paypal_order_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">PayPal Order ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{paymentData.paypal_order_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentData.paypal_order_id!)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {paymentData.paypal_transaction_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{paymentData.paypal_transaction_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentData.paypal_transaction_id!)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {paymentData.metadata && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Metadata</h5>
                      {paymentData.metadata.device_type && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Device:</span>
                          <span className="text-gray-900 capitalize">{paymentData.metadata.device_type}</span>
                        </div>
                      )}
                      {paymentData.metadata.ip_address && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">IP Address:</span>
                          <span className="text-gray-900 font-mono">{paymentData.metadata.ip_address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{paymentData.customer_name}</p>
                    <p className="text-xs text-gray-600">Customer Name</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{paymentData.customer_email}</p>
                    <p className="text-xs text-gray-600">Email Address</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Method Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-800">Payment Method</h4>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">PayPal</span>
                  <div className="ml-auto">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Detection */}
              {paymentData.metadata?.device_type && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-800">Device</h4>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {paymentData.metadata.device_type === 'mobile' ? (
                      <Smartphone className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Monitor className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {paymentData.metadata.device_type}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced PayPal Payment Section */}
        {paymentData.status === 'pending' && (
          <Card className="mt-6 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Complete Your Payment</CardTitle>
                  <CardDescription className="text-blue-700">
                    Secure payment processing powered by PayPal
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount to Pay:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {paymentData.currency} {paymentData.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-medium">PayPal</span>
                </div>
              </div>

              {/* PayPal Buttons */}
              <div className="bg-white rounded-lg p-6 border border-blue-200">
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
                      label: 'paypal',
                      height: 45
                    }}
                  />
                </PayPalScriptProvider>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
                  <p className="text-sm text-green-700">
                    Your payment information is encrypted and processed securely by PayPal. 
                    We never store your payment details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {paymentStep === 'processing' && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Processing Payment</h3>
                <p className="text-blue-700 mb-4">Please wait while we process your payment...</p>
                <Progress value={progress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-blue-600 mt-2">{progress}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Success Message */}
        {paymentData.status === 'completed' && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Completed Successfully!</h3>
                <p className="text-green-700 mb-6">
                  Thank you for your payment. You will receive a confirmation email shortly.
                </p>
                
                {/* Transaction Details */}
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <p className="font-mono text-gray-900">{paymentData.paypal_transaction_id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount Paid:</span>
                      <p className="font-semibold text-gray-900">{paymentData.currency} {paymentData.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.paypal_transaction_id || paymentData.id)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Transaction ID
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error States */}
        {paymentData.status === 'failed' && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">Payment Failed</h3>
                <p className="text-red-700 mb-4">
                  Unfortunately, your payment could not be processed. Please try again or contact support.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentData.status === 'cancelled' && (
          <Card className="mt-6 border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Cancelled</h3>
                <p className="text-gray-700 mb-4">
                  This payment has been cancelled. You can create a new payment link if needed.
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Trusted by PayPal</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by Zignals • Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
}