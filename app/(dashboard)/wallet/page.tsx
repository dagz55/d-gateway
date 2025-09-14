import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { redirect } from 'next/navigation';
import DepositComponent from '@/components/wallet/DepositComponent';
import DepositHistory from '@/components/wallet/DepositHistory';
import WithdrawComponent from '@/components/wallet/WithdrawComponent';
import WithdrawalHistory from '@/components/wallet/WithdrawalHistory';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/');
    }

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Trader';

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
                <div className="text-3xl font-bold text-foreground">$11,400.00</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">+$1,400</span>
                  <span className="text-muted-foreground text-sm">(+14.0%)</span>
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
                <div className="text-3xl font-bold text-foreground">$2,850.00</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">+$450</span>
                  <span className="text-muted-foreground text-sm">(+18.7%)</span>
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
                <div className="text-3xl font-bold text-foreground">$14,250.00</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">+$1,850</span>
                  <span className="text-muted-foreground text-sm">(+14.9%)</span>
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
                <WithdrawComponent />
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
    console.warn('Supabase auth error in wallet page:', error);
    redirect('/');
  }
}
