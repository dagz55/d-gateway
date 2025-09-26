'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, DollarSign, User, Mail, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalPaymentLinkProps {
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: any) => void;
}

interface PaymentLinkData {
  amount: string;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  paymentLink: string;
}

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
];

export default function PayPalPaymentLink({ onPaymentSuccess, onPaymentError }: PayPalPaymentLinkProps) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    customerName: '',
    customerEmail: '',
  });
  
  const [generatedLink, setGeneratedLink] = useState<PaymentLinkData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // PayPal configuration
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb', // Use sandbox for development
    currency: formData.currency,
    intent: 'capture' as const,
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePaymentLink = async () => {
    if (!formData.amount || !formData.description || !formData.customerName || !formData.customerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/payments/paypal/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const paymentData = await response.json();
      setGeneratedLink(paymentData);
      toast.success('Payment link generated successfully!');
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast.error('Failed to generate payment link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handlePayPalApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
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
          paymentId: generatedLink?.paymentId,
          status: 'completed',
          paypalOrderId: order.id,
          transactionDetails: order,
        }),
      });

      if (response.ok) {
        setPaymentStatus('success');
        toast.success('Payment completed successfully!');
        onPaymentSuccess?.(order);
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Payment failed. Please try again.');
      onPaymentError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    setPaymentStatus('error');
    toast.error('Payment failed. Please try again.');
    onPaymentError?.(error);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      currency: 'USD',
      description: '',
      customerName: '',
      customerEmail: '',
    });
    setGeneratedLink(null);
    setPaymentStatus('idle');
  };

  const selectedCurrency = currencies.find(c => c.value === formData.currency);

  return (
    <div className="space-y-6">
      {/* Payment Link Generator Form */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            PayPal Payment Link Generator
          </CardTitle>
          <CardDescription>
            Create a secure PayPal payment link that customers can use to make payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                required
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <span>{currency.symbol}</span>
                        <span>{currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Payment Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this payment is for..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-card/50 border-border/30 focus:border-accent min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                Customer Name *
              </Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                required
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400" />
                Customer Email *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                required
              />
            </div>
          </div>

          <Button
            onClick={generatePaymentLink}
            disabled={isGenerating || !formData.amount || !formData.description || !formData.customerName || !formData.customerEmail}
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Link...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Generate Payment Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Payment Link */}
      {generatedLink && (
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Payment Link Generated
            </CardTitle>
            <CardDescription>
              Share this link with your customer to collect payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-card/30 rounded-lg p-4 border border-border/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-semibold text-lg">
                    {selectedCurrency?.symbol}{generatedLink.amount} {generatedLink.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge 
                    variant={generatedLink.status === 'completed' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {generatedLink.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Customer</Label>
                  <p className="font-medium">{generatedLink.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{generatedLink.customerEmail}</p>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="font-medium">{generatedLink.description}</p>
              </div>
            </div>

            {/* Payment Link */}
            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink.paymentLink}
                  readOnly
                  className="bg-card/50 border-border/30 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink.paymentLink)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            {/* PayPal Payment Button */}
            {paymentStatus !== 'success' && (
              <div className="space-y-4">
                <Label>Test Payment (PayPal)</Label>
                <div className="bg-card/30 rounded-lg p-4 border border-border/20">
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: generatedLink.amount,
                                currency_code: generatedLink.currency,
                              },
                              description: generatedLink.description,
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
              </div>
            )}

            {/* Payment Status */}
            {paymentStatus === 'processing' && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                Processing payment...
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                Payment completed successfully!
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                Payment failed. Please try again.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(generatedLink.paymentLink, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex items-center gap-2"
              >
                Create New Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
