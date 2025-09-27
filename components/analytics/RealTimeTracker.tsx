'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Zap, TrendingUp, Users, DollarSign, Clock, 
  Play, Pause, Square, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface PaymentEvent {
  id: string;
  type: 'payment_created' | 'payment_completed' | 'payment_failed' | 'payment_cancelled';
  paymentId: string;
  amount: number;
  currency: string;
  customerName: string;
  timestamp: string;
  deviceType: string;
  country?: string;
}

interface RealTimeStats {
  totalPayments: number;
  totalRevenue: number;
  successRate: number;
  activeUsers: number;
  lastUpdate: string;
}

interface RealTimeTrackerProps {
  paymentId?: string;
  autoStart?: boolean;
  className?: string;
}

export default function RealTimeTracker({ 
  paymentId, 
  autoStart = true, 
  className = '' 
}: RealTimeTrackerProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    totalPayments: 0,
    totalRevenue: 0,
    successRate: 0,
    activeUsers: 0,
    lastUpdate: new Date().toISOString(),
  });
  const [showDetails, setShowDetails] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time events (in production, use WebSocket or Server-Sent Events)
  const simulateEvent = (): PaymentEvent => {
    const types: PaymentEvent['type'][] = ['payment_created', 'payment_completed', 'payment_failed', 'payment_cancelled'];
    const currencies = ['USD', 'EUR', 'GBP', 'PHP'];
    const deviceTypes = ['desktop', 'mobile', 'tablet'];
    const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 1000) + 10;
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    return {
      id: Math.random().toString(36).substring(7),
      type,
      paymentId: Math.random().toString(36).substring(7),
      amount,
      currency,
      customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      deviceType,
      country,
    };
  };

  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      totalPayments: prev.totalPayments + Math.floor(Math.random() * 3),
      totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 500),
      successRate: Math.min(95, prev.successRate + Math.random() * 2),
      activeUsers: Math.floor(Math.random() * 50) + 10,
      lastUpdate: new Date().toISOString(),
    }));
  };


  const stopTracking = () => {
    setIsActive(false);
    setConnectionStatus('disconnected');
    
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  useEffect(() => {
    if (!isActive) return;
    
    setConnectionStatus('connecting');
    
    // Simulate connection
    const connectionTimeout = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);

    // Simulate real-time events
    const eventInterval = setInterval(() => {
      const newEvent = simulateEvent();
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
    }, Math.random() * 5000 + 2000); // Random interval between 2-7 seconds

    // Update stats every 10 seconds
    const statsInterval = setInterval(() => {
      updateStats();
    }, 10000);

    statsIntervalRef.current = statsInterval;

    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(eventInterval);
      clearInterval(statsInterval);
    };
  }, [isActive]);

  const getEventIcon = (type: PaymentEvent['type']) => {
    switch (type) {
      case 'payment_created': return <Zap className="h-4 w-4 text-blue-600" />;
      case 'payment_completed': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'payment_failed': return <Activity className="h-4 w-4 text-red-600" />;
      case 'payment_cancelled': return <Square className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: PaymentEvent['type']) => {
    switch (type) {
      case 'payment_created': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'payment_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'payment_failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Payment Tracker</h2>
          <p className="text-gray-600">Live payment activity monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'connecting'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-600 animate-pulse' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-600 animate-pulse'
                : 'bg-red-600'
            }`}></div>
            {connectionStatus === 'connected' ? 'Live' : 
             connectionStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isActive ? stopTracking : () => setIsActive(true)}
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue, 'USD')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Payment Events
              </CardTitle>
              <CardDescription>
                Real-time payment activity feed
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearEvents}
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No events yet. Start tracking to see live activity.</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getEventIcon(event.type)}
                    <div>
                      <p className="font-medium text-gray-900">{event.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(event.amount, event.currency)}
                        {showDetails && (
                          <span className="ml-2">
                            • {event.deviceType} • {event.country}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getEventColor(event.type)} border`}>
                      {event.type.replace('payment_', '')}
                    </Badge>
                    <span className="text-sm text-gray-500 font-mono">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
