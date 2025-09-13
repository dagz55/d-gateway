'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';
import { useCreateWithdrawal } from '@/hooks/api/useWithdrawals';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'USDT', 'PHP']),
  destination: z.string().min(1, 'Destination is required'),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function WithdrawForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createWithdrawal = useCreateWithdrawal();
  const { data: stats } = useDashboardStats();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const currency = watch('currency');
  const amount = watch('amount');

  const onSubmit = async (data: WithdrawFormData) => {
    // Check if user has sufficient balance
    if (stats && data.amount > stats.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWithdrawal.mutateAsync(data);
      toast.success('Withdrawal request submitted successfully!');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>
          Withdraw funds from your trading account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available Balance:</span>
              <span className="text-lg font-bold">
                {stats ? formatCurrency(stats.balance) : 'Loading...'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={stats?.balance || 0}
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
            {amount && stats && amount > stats.balance && (
              <p className="text-sm text-destructive">
                Amount exceeds available balance
              </p>
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
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              {...register('destination')}
              placeholder="Bank account, wallet address, etc."
              disabled={isSubmitting}
            />
            {errors.destination && (
              <p className="text-sm text-destructive">{errors.destination.message}</p>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Withdrawal Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum withdrawal: $50</li>
              <li>• Processing time: 2-5 business days</li>
              <li>• Withdrawal fee: $5 (waived for amounts over $500)</li>
              <li>• You will receive a confirmation email</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !!(amount && stats && amount > stats.balance)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
