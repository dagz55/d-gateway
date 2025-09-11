'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, DollarSign, Star, TrendingUp, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();

  const getTraderLevelColor = (level: string) => {
    switch (level) {
      case 'PROFESSIONAL':
        return 'bg-purple-500 text-white';
      case 'EXPERT':
        return 'bg-red-500 text-white';
      case 'ADVANCED':
        return 'bg-orange-500 text-white';
      case 'INTERMEDIATE':
        return 'bg-yellow-500 text-black';
      case 'BEGINNER':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500';
      case 'IDLE':
        return 'bg-orange-500';
      case 'OFFLINE':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                <AvatarFallback className="text-lg">
                  {session?.user?.name ? getInitials(session.user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{session?.user?.name || 'N/A'}</h3>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor((session?.user as { status?: string })?.status || 'OFFLINE')}`} />
                  <span className="text-sm text-muted-foreground">
                    {(session?.user as { status?: string })?.status || 'OFFLINE'}
                  </span>
                  {(session?.user as { isVerified?: boolean })?.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Full Name:</span>
                <span className="text-sm">{session?.user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Username:</span>
                <span className="text-sm">{(session?.user as { username?: string })?.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{session?.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Age:</span>
                <span className="text-sm">{(session?.user as { age?: number })?.age || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gender:</span>
                <span className="text-sm">{(session?.user as { gender?: string })?.gender || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trading Information
            </CardTitle>
            <CardDescription>Your trading level and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Trader Level:</span>
                <Badge className={getTraderLevelColor((session?.user as { traderLevel?: string })?.traderLevel || 'BEGINNER')}>
                  {(session?.user as { traderLevel?: string })?.traderLevel || 'BEGINNER'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Package:</span>
                <Badge variant="outline">
                  {(session?.user as { package?: string })?.package || 'BASIC'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Verification:</span>
                <Badge variant={(session?.user as { isVerified?: boolean })?.isVerified ? "default" : "secondary"}>
                  {(session?.user as { isVerified?: boolean })?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Account Balance:
                </span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency((session?.user as { accountBalance?: number })?.accountBalance || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Account Statistics
          </CardTitle>
          <CardDescription>Your trading performance and account metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency((session?.user as { accountBalance?: number })?.accountBalance || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Balance</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(session?.user as { traderLevel?: string })?.traderLevel || 'BEGINNER'}
              </div>
              <div className="text-sm text-muted-foreground">Trading Level</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(session?.user as { package?: string })?.package || 'BASIC'}
              </div>
              <div className="text-sm text-muted-foreground">Subscription</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
