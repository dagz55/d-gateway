'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpRight, Upload, DollarSign, Hash, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { validateImageFile, ACCEPT_FILE_TYPES } from '@/lib/validation';
import { toast } from 'sonner';
import Image from 'next/image';

interface DepositFormData {
  amount: string;
  referenceNumber: string;
  methodOfPayment: string;
  screenshot: File | null;
  notes: string;
}

const mockPaymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🔵' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
];

export default function DepositComponent() {
  const [formData, setFormData] = useState<DepositFormData>({
    amount: '',
    referenceNumber: '',
    methodOfPayment: '',
    screenshot: null,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(false);

  // Cleanup object URL on component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (field: keyof DepositFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using shared validation
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error!);
        // Revoke any created object URL and clear preview
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        if (isMountedRef.current) {
          setPreviewUrl(null);
          setFormData(prev => ({ ...prev, screenshot: null }));
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          fileInputRef.current.focus();
        }
        return;
      }

      // Revoke previous object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      
      if (isMountedRef.current) {
        setFormData(prev => ({ ...prev, screenshot: file }));
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreviewUrl(url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    if (isMountedRef.current) {
      setFormData({
        amount: '',
        referenceNumber: '',
        methodOfPayment: '',
        screenshot: null,
        notes: ''
      });
      
      // Clear preview first, then revoke object URL
      setPreviewUrl(null);
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    // Clear file input to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (isMountedRef.current) {
      setIsSubmitting(false);
    }
    
    // Show success message
    if (isMountedRef.current) {
      toast.success('Deposit request submitted successfully!');
    }
  };

  const isFormValid = formData.amount && formData.referenceNumber && formData.methodOfPayment;

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-accent" />
          Deposit Details
        </CardTitle>
        <CardDescription>
          Submit your deposit with amount, reference number, and screenshot for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter deposit amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-card/50 border-border/30 focus:border-accent"
              required
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference" className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-400" />
              Reference Number
            </Label>
            <Input
              id="reference"
              type="text"
              placeholder="Enter transaction reference number"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              className="bg-card/50 border-border/30 focus:border-accent"
              required
            />
          </div>

          {/* Method of Payment */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-yellow-400">💳</span>
              Method of Payment (MOP)
            </Label>
            <Select value={formData.methodOfPayment} onValueChange={(value) => handleInputChange('methodOfPayment', value)}>
              <SelectTrigger className="bg-card/50 border-border/30 focus:border-accent">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {mockPaymentMethods.map((method) => (
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

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              Attached Screenshot (SS)
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_FILE_TYPES}
                  onChange={handleFileChange}
                  className="bg-card/50 border-border/30 focus:border-accent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/20 file:text-accent hover:file:bg-accent/30"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <Image
                      src={previewUrl}
                      alt="Screenshot preview"
                      width={320}
                      height={192}
                      className="max-w-xs max-h-48 rounded-lg border border-border/30 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this deposit..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-card/50 border-border/30 focus:border-accent min-h-[100px]"
            />
          </div>

          {/* Trading Wallet Info */}
          <div className="bg-card/30 rounded-lg p-4 border border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">Trading Wallet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Deposited funds will be credited to your Trading Wallet and can be used for trading activities.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Deposit...
              </>
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Submit Deposit Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
