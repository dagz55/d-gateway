import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/clerk-auth';
import { requireAuth } from '@/lib/require-auth';
import DepositComponent from '@/components/wallet/DepositComponent';
import DepositHistory from '@/components/wallet/DepositHistory';
import WithdrawComponent from '@/components/wallet/WithdrawComponent';
import WithdrawalHistory from '@/components/wallet/WithdrawalHistory';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

async function getWalletData(userId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch user's transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wallet data:', error);
      return {
        tradingBalance: 0,
        incomeBalance: 0,
        totalPortfolio: 0,
        tradingChange: 0,
        tradingChangePercent: 0,
        incomeChange: 0,
        incomeChangePercent: 0,
        totalChange: 0,
        totalChangePercent: 0,
      };
    }

    // Calculate balances and changes
    const tradingTransactions = transactions?.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED') || [];
    const withdrawalTransactions = transactions?.filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED') || [];
    
    const tradingBalance = tradingTransactions.reduce((sum, t) => sum + t.amount, 0) - 
                          withdrawalTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // TODO: Calculate real income balance from trading profits/commissions
    const incomeBalance = 0; // Will be calculated from actual trading performance
    
    const totalPortfolio = tradingBalance + incomeBalance;
    
    // TODO: Calculate real changes from historical data
    const tradingChange = 0; // Will be calculated from trading history
    const tradingChangePercent = 0;
    
    const incomeChange = 0; // Will be calculated from income history
    const incomeChangePercent = 0;
    
    const totalChange = tradingChange + incomeChange;
    const totalChangePercent = 0;

    return {
      tradingBalance,
      incomeBalance,
      totalPortfolio,
      tradingChange,
      tradingChangePercent,
      incomeChange,
      incomeChangePercent,
      totalChange,
      totalChangePercent,
    };
  } catch (error) {
    console.error('Error calculating wallet data:', error);
    return {
      tradingBalance: 0,
      incomeBalance: 0,
      totalPortfolio: 0,
      tradingChange: 0,
      tradingChangePercent: 0,
      incomeChange: 0,
      incomeChangePercent: 0,
      totalChange: 0,
      totalChangePercent: 0,
    };
  }
}

export default async function WalletPage() {
  try {
    // Use requireAuth helper for cleaner auth flow
    const userId = await requireAuth();
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not found after authentication');
    }

    const firstName = user.firstName || 'Trader';
    const walletData = await getWalletData(userId);

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/20 border border-accent/30">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                <span className="gradient-text">Wallet</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your <span className="gradient-text font-semibold">deposits</span> and <span className="gradient-text font-semibold">withdrawals</span>
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
          <Card className="glass glass-hover card-glow-hover border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trading Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  ${walletData.tradingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">
                    +${walletData.tradingChange.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (+{walletData.tradingChangePercent}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover card-glow-hover border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  ${walletData.incomeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">
                    +${walletData.incomeChange.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (+{walletData.incomeChangePercent}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover card-glow-hover border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  ${walletData.totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">
                    +${walletData.totalChange.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (+{walletData.totalChangePercent}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Operations */}
        <Card className="glass glass-hover card-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              Wallet Operations
            </CardTitle>
            <CardDescription>
              Manage your deposits, withdrawals, and view transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="deposit" className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="deposit-history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Deposit History
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Withdraw
                </TabsTrigger>
                <TabsTrigger value="withdrawal-history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Withdrawal History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="mt-0">
                <DepositComponent />
              </TabsContent>

              <TabsContent value="deposit-history" className="mt-0">
                <DepositHistory />
              </TabsContent>

              <TabsContent value="withdraw" className="mt-0">
                <WithdrawComponent 
                  portfolioData={{
                    tradingBalance: walletData.tradingBalance,
                    incomeBalance: walletData.incomeBalance
                  }}
                />
              </TabsContent>

              <TabsContent value="withdrawal-history" className="mt-0">
                <WithdrawalHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.warn('WorkOS auth error in wallet page:', error);
    redirect('/');
  }
}
