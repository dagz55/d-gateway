'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDeposit } from '@/hooks/api/useDeposits';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'USDT', 'PHP']),
  method: z.string().min(1, 'Method is required'),
});

type DepositFormData = z.infer<typeof depositSchema>;

export default function DepositForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDeposit = useCreateDeposit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      currency: 'USD',
      method: 'bank',
    },
  });

  const currency = watch('currency');

  const onSubmit = async (data: DepositFormData) => {
    setIsSubmitting(true);
    try {
      await createDeposit.mutateAsync(data);
      toast.success('Deposit request submitted successfully!');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Deposit</CardTitle>
        <CardDescription>
          Add funds to your trading account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={currency}
              onValueChange={(value) => setValue('currency', value as 'USD' | 'USDT' | 'PHP')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="PHP">PHP</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select
              onValueChange={(value) => setValue('method', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-destructive">{errors.method.message}</p>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Deposit Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum deposit: $10</li>
              <li>• Processing time: 1-3 business days</li>
              <li>• No fees for deposits over $100</li>
              <li>• You will receive a confirmation email</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
