import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, DollarSign, Users, Activity, CheckCircle, XCircle, Clock, ExternalLink, Copy } from 'lucide-react';

export default async function AdminPayPalPaymentsPage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for PayPal payments
  const paymentStats = {
    totalRevenue: 125430.50,
    totalTransactions: 1247,
    successfulPayments: 1189,
    pendingPayments: 45,
    failedPayments: 13,
    averageOrderValue: 100.67,
    conversionRate: 95.3,
    refundRate: 2.1
  };

  const paymentLinks = [
    {
      id: 1,
      name: 'Basic Plan - Monthly',
      description: 'Monthly subscription for Basic trading signals',
      amount: 29.99,
      currency: 'USD',
      status: 'ACTIVE',
      created: '2024-01-10T10:30:00Z',
      totalPayments: 234,
      revenue: 7026.66,
      link: 'https://paypal.me/zignals/basic-monthly'
    },
    {
      id: 2,
      name: 'Pro Plan - Monthly',
      description: 'Monthly subscription for Pro trading signals',
      amount: 59.99,
      currency: 'USD',
      status: 'ACTIVE',
      created: '2024-01-08T14:20:00Z',
      totalPayments: 156,
      revenue: 9358.44,
      link: 'https://paypal.me/zignals/pro-monthly'
    },
    {
      id: 3,
      name: 'Premium Plan - Monthly',
      description: 'Monthly subscription for Premium trading signals',
      amount: 99.99,
      currency: 'USD',
      status: 'ACTIVE',
      created: '2024-01-05T09:15:00Z',
      totalPayments: 89,
      revenue: 8899.11,
      link: 'https://paypal.me/zignals/premium-monthly'
    },
    {
      id: 4,
      name: 'Basic Plan - Yearly',
      description: 'Yearly subscription for Basic trading signals',
      amount: 299.99,
      currency: 'USD',
      status: 'ACTIVE',
      created: '2024-01-12T16:45:00Z',
      totalPayments: 45,
      revenue: 13499.55,
      link: 'https://paypal.me/zignals/basic-yearly'
    },
    {
      id: 5,
      name: 'Test Payment Link',
      description: 'Test payment link for development',
      amount: 1.00,
      currency: 'USD',
      status: 'INACTIVE',
      created: '2024-01-14T11:30:00Z',
      totalPayments: 0,
      revenue: 0,
      link: 'https://paypal.me/zignals/test'
    }
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      customer: 'john.doe@example.com',
      amount: 59.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentLink: 'Pro Plan - Monthly',
      timestamp: '2024-01-15T12:30:00Z',
      transactionId: 'PAYID-123456789'
    },
    {
      id: 'TXN-002',
      customer: 'jane.smith@example.com',
      amount: 29.99,
      currency: 'USD',
      status: 'PENDING',
      paymentLink: 'Basic Plan - Monthly',
      timestamp: '2024-01-15T12:25:00Z',
      transactionId: 'PAYID-987654321'
    },
    {
      id: 'TXN-003',
      customer: 'mike.wilson@example.com',
      amount: 99.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentLink: 'Premium Plan - Monthly',
      timestamp: '2024-01-15T12:20:00Z',
      transactionId: 'PAYID-456789123'
    },
    {
      id: 'TXN-004',
      customer: 'sarah.jones@example.com',
      amount: 299.99,
      currency: 'USD',
      status: 'FAILED',
      paymentLink: 'Basic Plan - Yearly',
      timestamp: '2024-01-15T12:15:00Z',
      transactionId: 'PAYID-789123456'
    },
    {
      id: 'TXN-005',
      customer: 'alex.brown@example.com',
      amount: 59.99,
      currency: 'USD',
      status: 'REFUNDED',
      paymentLink: 'Pro Plan - Monthly',
      timestamp: '2024-01-15T12:10:00Z',
      transactionId: 'PAYID-321654987'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'INACTIVE': return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'REFUNDED': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      case 'REFUNDED': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="admin-dashboard space-y-8 p-6 dashboard-bg min-h-screen">
      {/* Enhanced backdrop with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20 pointer-events-none" />

      {/* Main content with proper z-index */}
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white gradient-text">PayPal Payments</h1>
            <p className="text-white/60 mt-2">Manage PayPal payment links and monitor transactions</p>
          </div>
          <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Payment Link
          </Button>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${paymentStats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{paymentStats.totalTransactions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{paymentStats.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-white">${paymentStats.averageOrderValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Links */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              Payment Links
            </CardTitle>
            <CardDescription>
              Manage and monitor your PayPal payment links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentLinks.map((link) => (
                <div
                  key={link.id}
                  className="glass-subtle rounded-xl p-6 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-white">
                        {link.name}
                      </div>
                      <Badge className={getStatusColor(link.status)}>
                        {link.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      Created: {new Date(link.created).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Amount</p>
                      <p className="text-lg font-semibold text-white">
                        ${link.amount} {link.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Total Payments</p>
                      <p className="text-lg font-semibold text-white">
                        {link.totalPayments}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-white">
                        ${link.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Description</p>
                      <p className="text-sm text-white/80">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-white/60 bg-black/20 px-3 py-1 rounded">
                      <span>{link.link}</span>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Test Link
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Monitor recent payment transactions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="glass-subtle rounded-xl p-4 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-semibold text-white">
                        {transaction.id}
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span>{transaction.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Customer:</span>
                      <div className="text-white">{transaction.customer}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Amount:</span>
                      <div className="text-white font-semibold">${transaction.amount} {transaction.currency}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Payment Link:</span>
                      <div className="text-white">{transaction.paymentLink}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Transaction ID:</span>
                      <div className="text-white font-mono text-xs">{transaction.transactionId}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common PayPal payment management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Plus className="w-6 h-6" />
                <span>Create New Link</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Activity className="w-6 h-6" />
                <span>View All Transactions</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <DollarSign className="w-6 h-6" />
                <span>Generate Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <CreditCard className="w-6 h-6" />
                <span>PayPal Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
