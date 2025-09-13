'use client';

import CopyTradingSignal from '@/components/dashboard/CopyTradingSignal';
import DepositForm from '@/components/dashboard/DepositForm';
import DepositHistoryTable from '@/components/dashboard/DepositHistoryTable';
import NewsFeed from '@/components/dashboard/NewsFeed';
import PersonalPerformanceChart from '@/components/dashboard/PersonalPerformanceChart';
import PortfolioDistributionChart from '@/components/dashboard/PortfolioDistributionChart';
import ProfitLossChart from '@/components/dashboard/ProfitLossChart';
import SignalsList from '@/components/dashboard/SignalsList';
import StatsRow from '@/components/dashboard/StatsRow';
import TradingActivityChart from '@/components/dashboard/TradingActivityChart';
import TradingHistoryTable from '@/components/dashboard/TradingHistoryTable';
import WithdrawForm from '@/components/dashboard/WithdrawForm';
import WithdrawalHistoryTable from '@/components/dashboard/WithdrawalHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your trading account.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsRow />
          <PersonalPerformanceChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <PortfolioDistributionChart />
            <SignalsList limit={5} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <PersonalPerformanceChart />
            <div className="grid gap-6 lg:grid-cols-2">
              <PortfolioDistributionChart />
              <ProfitLossChart />
            </div>
            <TradingActivityChart />
          </div>
        </TabsContent>

        <TabsContent value="trades">
          <TradingHistoryTable />
        </TabsContent>

        <TabsContent value="signals">
          <SignalsList />
        </TabsContent>

        <TabsContent value="copy-trading">
          <CopyTradingSignal />
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DepositForm />
            <DepositHistoryTable />
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <WithdrawForm />
            <WithdrawalHistoryTable />
          </div>
        </TabsContent>

        <TabsContent value="news">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
