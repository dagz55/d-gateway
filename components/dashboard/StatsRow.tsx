'use client';

import { AnimatedStatCard } from '@/components/ui/animated-stats';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';
import { CreditCard, DollarSign, Signal, TrendingUp } from 'lucide-react';

export default function StatsRow() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnimatedStatCard
            key={i}
            title="Loading..."
            value={0}
            icon={<div className="h-4 w-4 bg-muted animate-pulse rounded" />}
            delay={i * 0.1}
          />
        ))}
      </div>
    );
  }

  // Determine trend based on data
  const pnlTrend = (stats?.pnlToday || 0) >= 0 ? 'up' : 'down';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnimatedStatCard
        title="Total Balance"
        value={stats?.balance || 0}
        icon={<DollarSign className="h-4 w-4" />}
        format="currency"
        decimals={2}
        delay={0}
        trend="neutral"
      />

      <AnimatedStatCard
        title="Today's P&L"
        value={stats?.pnlToday || 0}
        change={Math.abs(stats?.pnlToday || 0)}
        changeLabel="24h change"
        icon={<TrendingUp className="h-4 w-4" />}
        format="currency"
        decimals={2}
        delay={0.1}
        trend={pnlTrend}
      />

      <AnimatedStatCard
        title="Open Signals"
        value={stats?.openSignals || 0}
        change={2}
        changeLabel="new signals"
        icon={<Signal className="h-4 w-4" />}
        format="number"
        decimals={0}
        delay={0.2}
        trend="up"
      />

      <AnimatedStatCard
        title="Last Deposit"
        value={stats?.lastDeposit || 0}
        icon={<CreditCard className="h-4 w-4" />}
        format="currency"
        decimals={2}
        delay={0.3}
        trend="neutral"
      />
    </div>
  );
}
