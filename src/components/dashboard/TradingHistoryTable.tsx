'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTrades } from '@/hooks/api/useTrades';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

export default function TradingHistoryTable() {
  const [search, setSearch] = useState('');
  const [pair, setPair] = useState('all');
  const [side, setSide] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useTrades({
    page,
    limit,
    search: search || undefined,
    pair: pair === 'all' ? undefined : pair,
    side: side === 'all' ? undefined : side,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const clearFilters = () => {
    setSearch('');
    setPair('all');
    setSide('all');
    setPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load trading history. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading History</CardTitle>
        <CardDescription>Your recent trading activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pair or side..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pairs</SelectItem>
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
            </SelectContent>
          </Select>
          <Select value={side} onValueChange={setSide}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sides</SelectItem>
              <SelectItem value="BUY">BUY</SelectItem>
              <SelectItem value="SELL">SELL</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No trades found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.pair}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade.side === 'BUY'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {trade.side}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(trade.price)}</TableCell>
                    <TableCell>{trade.qty}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(trade.time)}
                    </TableCell>
                    <TableCell>
                      {trade.pnl !== undefined ? (
                        <span
                          className={`font-medium ${
                            trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} trades
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
