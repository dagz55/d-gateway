'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Filter, Calendar, DollarSign, CreditCard, Download } from 'lucide-react';
import { useState } from 'react';

interface DepositHistoryEntry {
  id: string;
  date: string;
  time: string;
  amount: number;
  methodOfPayment: string;
  referenceNumber: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  walletType: 'Trading Wallet' | 'Income Wallet';
  transactionId: string;
  notes?: string;
}

const mockDepositHistory: DepositHistoryEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '14:30:25',
    amount: 1000,
    methodOfPayment: 'Bank Transfer',
    referenceNumber: 'REF-2024-001',
    status: 'completed',
    walletType: 'Trading Wallet',
    transactionId: 'TXN-001-2024',
    notes: 'Initial deposit for trading'
  },
  {
    id: '2',
    date: '2024-01-14',
    time: '09:15:42',
    amount: 500,
    methodOfPayment: 'Credit Card',
    referenceNumber: 'REF-2024-002',
    status: 'completed',
    walletType: 'Trading Wallet',
    transactionId: 'TXN-002-2024'
  },
  {
    id: '3',
    date: '2024-01-13',
    time: '16:45:18',
    amount: 2000,
    methodOfPayment: 'Cryptocurrency',
    referenceNumber: 'REF-2024-003',
    status: 'completed',
    walletType: 'Income Wallet',
    transactionId: 'TXN-003-2024'
  },
  {
    id: '4',
    date: '2024-01-12',
    time: '11:22:35',
    amount: 750,
    methodOfPayment: 'PayPal',
    referenceNumber: 'REF-2024-004',
    status: 'processing',
    walletType: 'Trading Wallet',
    transactionId: 'TXN-004-2024'
  },
  {
    id: '5',
    date: '2024-01-11',
    time: '13:18:55',
    amount: 1200,
    methodOfPayment: 'E-Wallet',
    referenceNumber: 'REF-2024-005',
    status: 'pending',
    walletType: 'Trading Wallet',
    transactionId: 'TXN-005-2024'
  },
  {
    id: '6',
    date: '2024-01-10',
    time: '08:05:12',
    amount: 800,
    methodOfPayment: 'Bank Transfer',
    referenceNumber: 'REF-2024-006',
    status: 'failed',
    walletType: 'Income Wallet',
    transactionId: 'TXN-006-2024',
    notes: 'Insufficient funds'
  }
];

export default function DepositHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mopFilter, setMopFilter] = useState<string>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');

  const filteredHistory = mockDepositHistory.filter(entry => {
    const matchesSearch = 
      entry.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesMop = mopFilter === 'all' || entry.methodOfPayment === mopFilter;
    const matchesWallet = walletFilter === 'all' || entry.walletType === walletFilter;

    return matchesSearch && matchesStatus && matchesMop && matchesWallet;
  });

  const totalDeposits = mockDepositHistory
    .filter(entry => entry.status === 'completed')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const pendingAmount = mockDepositHistory
    .filter(entry => entry.status === 'pending' || entry.status === 'processing')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMopIcon = (mop: string) => {
    switch (mop) {
      case 'Bank Transfer': return '🏦';
      case 'Credit Card': return '💳';
      case 'PayPal': return '🔵';
      case 'Cryptocurrency': return '₿';
      case 'E-Wallet': return '📱';
      default: return '💳';
    }
  };

  return (
    <Card className="glass glass-hover card-glow-hover border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent" />
          Deposit History
        </CardTitle>
        <CardDescription>
          View your deposit history with date/time, amount, MOP type, and wallet details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Total Deposits</span>
            </div>
            <div className="text-xl font-bold text-green-400">${totalDeposits.toFixed(2)}</div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Pending Amount</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">${pendingAmount.toFixed(2)}</div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total Transactions</span>
            </div>
            <div className="text-xl font-bold text-blue-400">{mockDepositHistory.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, transaction ID, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-card/50 border-border/30 focus:border-accent"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/30 focus:border-accent">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mopFilter} onValueChange={setMopFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/30 focus:border-accent">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
              <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
              <SelectItem value="E-Wallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={walletFilter} onValueChange={setWalletFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/30 focus:border-accent">
              <SelectValue placeholder="Wallet Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              <SelectItem value="Trading Wallet">Trading Wallet</SelectItem>
              <SelectItem value="Income Wallet">Income Wallet</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setMopFilter('all');
              setWalletFilter('all');
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* History Table */}
        <div className="space-y-3">
          {filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className="bg-card/30 rounded-lg p-4 border border-border/20 hover:border-border/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{entry.date}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{entry.time}</div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">${entry.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <span>{getMopIcon(entry.methodOfPayment)}</span>
                      <span>{entry.methodOfPayment}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">MOP Type</div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{entry.walletType}</div>
                    <div className="text-xs text-muted-foreground">Wallet Details</div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{entry.referenceNumber}</div>
                    <div className="text-xs text-muted-foreground">Ref #</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Badge>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Receipt
                  </Button>
                </div>
              </div>

              {entry.notes && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Notes:</span> {entry.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No deposit history found with current filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
