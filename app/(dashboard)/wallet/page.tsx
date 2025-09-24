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
import { getUserProfileByClerkIdServer } from '@/lib/supabase/clerk-integration';

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

    // Fetch user's trading history for income calculations
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
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

    // ZIG-001: Calculate real income balance from trading profits/commissions
    const completedTrades = trades?.filter(t => t.status === 'COMPLETED') || [];
    const incomeBalance = completedTrades.reduce((sum, trade) => {
      const profit = trade.exit_price && trade.entry_price ?
        (trade.exit_price - trade.entry_price) * trade.quantity : 0;
      return sum + Math.max(0, profit); // Only count positive profits
    }, 0);

    const totalPortfolio = tradingBalance + incomeBalance;

    // ZIG-002: Calculate real changes from historical data (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentTradingTransactions = tradingTransactions.filter(t =>
      new Date(t.created_at) >= yesterday
    );
    const recentWithdrawals = withdrawalTransactions.filter(t =>
      new Date(t.created_at) >= yesterday
    );

    const tradingChange = recentTradingTransactions.reduce((sum, t) => sum + t.amount, 0) -
                         recentWithdrawals.reduce((sum, t) => sum + t.amount, 0);

    // ZIG-003: Calculate percent with division by zero protection
    const tradingChangePercent = tradingBalance > 0 ?
      (tradingChange / tradingBalance) * 100 : 0;

    const recentTrades = completedTrades.filter(t =>
      new Date(t.updated_at) >= yesterday
    );
    const incomeChange = recentTrades.reduce((sum, trade) => {
      const profit = trade.exit_price && trade.entry_price ?
        (trade.exit_price - trade.entry_price) * trade.quantity : 0;
      return sum + Math.max(0, profit);
    }, 0);

    const incomeChangePercent = incomeBalance > 0 ?
      (incomeChange / incomeBalance) * 100 : 0;

    const totalChange = tradingChange + incomeChange;
    const totalChangePercent = totalPortfolio > 0 ?
      (totalChange / totalPortfolio) * 100 : 0;

    return {
      tradingBalance,
      incomeBalance,
      totalPortfolio,
      tradingChange,
      tradingChangePercent: Math.round(tradingChangePercent * 100) / 100, // Round to 2 decimal places
      incomeChange,
      incomeChangePercent: Math.round(incomeChangePercent * 100) / 100,
      totalChange,
      totalChangePercent: Math.round(totalChangePercent * 100) / 100,
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

function renderWalletPage(walletData: any, firstName: string) {
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
}

export default async function WalletPage() {
  try {
    // Use requireAuth helper for cleaner auth flow
    const clerkUserId = await requireAuth();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not found after authentication');
    }

    // Get user profile from Supabase to get the correct user_id for transactions
    let userProfile = await getUserProfileByClerkIdServer(clerkUserId);

    if (!userProfile) {
      console.log('User profile not found in Supabase for Clerk ID:', clerkUserId, '- Creating new profile');
      
      // Create a new user profile in Supabase
      const { syncClerkUserWithProfile } = await import('@/lib/supabase/clerk-integration');
      
      const clerkUserData = {
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
        imageUrl: user.imageUrl || null,
      };
      
      userProfile = await syncClerkUserWithProfile(clerkUserId, clerkUserData);
      
      if (!userProfile) {
        console.error('Failed to create user profile for Clerk ID:', clerkUserId);
        // Fall back to using Clerk ID directly (for backward compatibility)
        const walletData = await getWalletData(clerkUserId);
        const firstName = user.firstName || 'Trader';

        return renderWalletPage(walletData, firstName);
      }
    }

    const firstName = user.firstName || 'Trader';
    const walletData = await getWalletData(userProfile.user_id);

    return renderWalletPage(walletData, firstName);
  } catch (error) {
    console.warn('Auth error in wallet page:', error);
    redirect('/');
  }
}