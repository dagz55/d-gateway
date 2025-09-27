'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus, ExternalLink, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [formData, setFormData] = useState({
    amount: '10',
    currency: 'USD',
    description: 'consultation',
    customerName: 'Dagz Suarez',
    customerEmail: 'dagz55@yahoo.com',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePaymentLink = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payment link generated successfully!');
    } catch (error) {
      toast.error('Failed to generate payment link');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          PayPal <span className="text-orange-400">Payments</span>
        </h1>
        <p className="text-gray-300">
          Manage PayPal payment links and monitor transactions
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent border-border/50 text-gray-300 hover:bg-card/20"
        >
          <Plus className="h-4 w-4" />
          Create Payment Link
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent border-border/50 text-gray-300 hover:bg-card/20"
        >
          <CreditCard className="h-4 w-4" />
          Manage Payments
        </Button>
      </div>

      {/* Create New Payment Link */}
      <Card className="bg-card/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5" />
            Create New Payment Link
          </CardTitle>
          <CardDescription className="text-gray-400">
            Generate a secure PayPal payment link for your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PayPal Payment Link Generator */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              PayPal Payment Link Generator
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Create a secure PayPal payment link that customers can use to make payments
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="bg-card/50 border-border/30 text-white"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">
                  Currency *
                </Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="bg-card/50 border-border/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Payment Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-card/50 border-border/30 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-white">
                  Customer Name *
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="bg-card/50 border-border/30 text-white"
                />
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-white">
                  Customer Email *
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className="bg-card/50 border-border/30 text-white"
                />
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generatePaymentLink}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Generate Payment Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
