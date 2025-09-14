'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDownLeft, DollarSign, User, CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';

interface WithdrawFormData {
  completeName: string;
  username: string;
  bankEwalletDetails: string;
  amountToWithdraw: string;
  walletSource: 'Trading Wallet' | 'Income Wallet';
  methodOfPayment: string;
  notes: string;
}

const mockWithdrawalMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🔵' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
];

export default function WithdrawComponent() {
  const [formData, setFormData] = useState<WithdrawFormData>({
    completeName: '',
    username: '',
    bankEwalletDetails: '',
    amountToWithdraw: '',
    walletSource: 'Income Wallet',
    methodOfPayment: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock portfolio values
  const portfolioValues = {
    'Trading Wallet': 11400.00,
    'Income Wallet': 2850.00
  };

  const handleInputChange = (field: keyof WithdrawFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      completeName: '',
      username: '',
      bankEwalletDetails: '',
      amountToWithdraw: '',
      walletSource: 'Income Wallet',
      methodOfPayment: '',
      notes: ''
    });
    setIsSubmitting(false);
    
    // Show success message
    alert('Withdrawal request submitted successfully!');
  };

  const isFormValid = 
    formData.completeName && 
    formData.username && 
    formData.bankEwalletDetails && 
    formData.amountToWithdraw && 
    formData.methodOfPayment;

  const availableBalance = portfolioValues[formData.walletSource];
  const withdrawAmount = parseFloat(formData.amountToWithdraw) || 0;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= availableBalance;

  return (
    <div className="space-y-6">
      {/* Portfolio Value Display */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-accent" />
            Portfolio Value (Wallet Balance)
          </CardTitle>
          <CardDescription>
            Current balance available for withdrawal from your wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/50 rounded-lg p-4 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-muted-foreground">Trading Wallet</span>
              </div>
              <div className="text-2xl font-bold text-green-400">${portfolioValues['Trading Wallet'].toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Available for withdrawal</div>
            </div>

            <div className="bg-card/50 rounded-lg p-4 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground">Income Wallet</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">${portfolioValues['Income Wallet'].toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Available for withdrawal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card className="glass glass-hover card-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-accent" />
            Withdrawal Request
          </CardTitle>
          <CardDescription>
            Complete name, username, bank/ewallet details, and amount to withdraw
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Complete Name */}
            <div className="space-y-2">
              <Label htmlFor="completeName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-400" />
                Complete Name
              </Label>
              <Input
                id="completeName"
                type="text"
                placeholder="Enter your complete full name"
                value={formData.completeName}
                onChange={(e) => handleInputChange('completeName', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                required
              />
            </div>

            {/* Bank/E-Wallet Details */}
            <div className="space-y-2">
              <Label htmlFor="bankDetails" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-400" />
                Bank/E-Wallet Details
              </Label>
              <Textarea
                id="bankDetails"
                placeholder="Enter your bank account details or e-wallet information (account number, routing number, etc.)"
                value={formData.bankEwalletDetails}
                onChange={(e) => handleInputChange('bankEwalletDetails', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent min-h-[100px]"
                required
              />
            </div>

            {/* Wallet Source */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-yellow-400" />
                Withdraw From
              </Label>
              <Select value={formData.walletSource} onValueChange={(value: 'Trading Wallet' | 'Income Wallet') => handleInputChange('walletSource', value)}>
                <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trading Wallet">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">💰</span>
                      <span>Trading Wallet (${portfolioValues['Trading Wallet'].toFixed(2)})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Income Wallet">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">💎</span>
                      <span>Income Wallet (${portfolioValues['Income Wallet'].toFixed(2)})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount to Withdraw */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />
                Amount to Withdraw
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Enter amount (Max: $${availableBalance.toFixed(2)})`}
                value={formData.amountToWithdraw}
                onChange={(e) => handleInputChange('amountToWithdraw', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent"
                max={availableBalance}
                required
              />
              {formData.amountToWithdraw && (
                <div className="text-sm">
                  {isValidAmount ? (
                    <span className="text-green-400">✓ Valid amount</span>
                  ) : (
                    <span className="text-red-400">✗ Amount exceeds available balance</span>
                  )}
                </div>
              )}
            </div>

            {/* Method of Payment */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-yellow-400">💳</span>
                Method of Payment (MOP)
              </Label>
              <Select value={formData.methodOfPayment} onValueChange={(value) => handleInputChange('methodOfPayment', value)}>
                <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  {mockWithdrawalMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this withdrawal..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="bg-card/50 border-border/30 focus:border-accent min-h-[80px]"
              />
            </div>

            {/* Income Wallet Info */}
            <div className="bg-card/30 rounded-lg p-4 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">Income Wallet</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Withdrawn funds will be processed from your selected wallet and transferred to your specified account.
                Processing time: 1-3 business days.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || !isValidAmount || isSubmitting}
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Withdrawal...
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Submit Withdrawal Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
