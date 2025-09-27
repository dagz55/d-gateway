import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Signal, TrendingUp, TrendingDown, Clock, Users, DollarSign } from 'lucide-react';

export default async function AdminSignalsPage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for signals - in production this would come from your database
  const signals = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      type: 'BUY',
      entryPrice: 43250.00,
      targetPrice: 44500.00,
      stopLoss: 42000.00,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      subscribers: 1247,
      successRate: 87.5,
      profit: 2.89
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      type: 'SELL',
      entryPrice: 2650.00,
      targetPrice: 2500.00,
      stopLoss: 2750.00,
      status: 'COMPLETED',
      createdAt: '2024-01-14T15:45:00Z',
      subscribers: 892,
      successRate: 92.3,
      profit: 5.66
    },
    {
      id: 3,
      symbol: 'ADA/USDT',
      type: 'BUY',
      entryPrice: 0.4850,
      targetPrice: 0.5200,
      stopLoss: 0.4600,
      status: 'PENDING',
      createdAt: '2024-01-15T08:15:00Z',
      subscribers: 634,
      successRate: 78.9,
      profit: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'BUY' 
      ? 'bg-green-500/20 text-green-400 border-green-400/30'
      : 'bg-red-500/20 text-red-400 border-red-400/30';
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
            <h1 className="text-3xl font-bold text-white gradient-text">Trading Signals</h1>
            <p className="text-white/60 mt-2">Monitor and manage trading signals performance</p>
          </div>
          <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
            <Signal className="w-4 h-4 mr-2" />
            Create New Signal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Signals</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Subscribers</p>
                  <p className="text-2xl font-bold text-white">2,773</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Avg. Success Rate</p>
                  <p className="text-2xl font-bold text-white">86.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Profit</p>
                  <p className="text-2xl font-bold text-white">+8.55%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signals Table */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Signal className="h-5 w-5 text-accent" />
              Recent Signals
            </CardTitle>
            <CardDescription>
              View and manage all trading signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  className="glass-subtle rounded-xl p-6 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-white">
                        {signal.symbol}
                      </div>
                      <Badge className={getTypeColor(signal.type)}>
                        {signal.type}
                      </Badge>
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(signal.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Entry Price</p>
                      <p className="text-lg font-semibold text-white">
                        ${signal.entryPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Target Price</p>
                      <p className="text-lg font-semibold text-white">
                        ${signal.targetPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Stop Loss</p>
                      <p className="text-lg font-semibold text-white">
                        ${signal.stopLoss.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Current Profit</p>
                      <p className={`text-lg font-semibold ${signal.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.profit > 0 ? '+' : ''}{signal.profit}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">
                          {signal.subscribers} subscribers
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">
                          {signal.successRate}% success rate
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
