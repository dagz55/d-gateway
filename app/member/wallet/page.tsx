import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import StatusDot from '@/components/ui/StatusDot';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function MemberWalletPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your deposits, withdrawals, and trading balance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Deposit</Button>
          <Button>Withdraw</Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Balance</CardTitle>
            <StatusDot status="success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,238.90</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <StatusDot status="warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,500.00</div>
            <p className="text-xs text-muted-foreground">Processing...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <StatusDot status="success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$12,489.32</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Deposit', amount: '+$5,000.00', status: 'Completed', date: '2 hours ago' },
              { type: 'Trade Profit', amount: '+$489.32', status: 'Completed', date: '4 hours ago' },
              { type: 'Withdrawal', amount: '-$1,000.00', status: 'Processing', date: '1 day ago' },
              { type: 'Trade Profit', amount: '+$234.56', status: 'Completed', date: '2 days ago' },
            ].map((transaction, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    transaction.status === 'Completed' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {transaction.status}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{transaction.type}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-mono font-semibold ${
                  transaction.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
