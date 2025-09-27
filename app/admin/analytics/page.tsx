import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Eye, Download, Calendar, Target, PieChart } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for analytics
  const analyticsStats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsers: 45,
    revenue: 125430.50,
    conversionRate: 12.5,
    avgSessionDuration: '4m 32s',
    pageViews: 45678,
    bounceRate: 23.4
  };

  const userGrowth = [
    { month: 'Jan', users: 1200, revenue: 45000 },
    { month: 'Feb', users: 1350, revenue: 52000 },
    { month: 'Mar', users: 1180, revenue: 48000 },
    { month: 'Apr', users: 1420, revenue: 61000 },
    { month: 'May', users: 1380, revenue: 58000 },
    { month: 'Jun', users: 1247, revenue: 125430 }
  ];

  const topPages = [
    { page: '/dashboard', views: 12450, uniqueVisitors: 892, avgTime: '3m 45s' },
    { page: '/trading', views: 9876, uniqueVisitors: 654, avgTime: '5m 12s' },
    { page: '/signals', views: 7654, uniqueVisitors: 543, avgTime: '2m 30s' },
    { page: '/packages', views: 5432, uniqueVisitors: 321, avgTime: '4m 15s' },
    { page: '/profile', views: 4321, uniqueVisitors: 289, avgTime: '1m 45s' }
  ];

  const deviceStats = [
    { device: 'Desktop', percentage: 65, users: 810 },
    { device: 'Mobile', percentage: 30, users: 374 },
    { device: 'Tablet', percentage: 5, users: 63 }
  ];

  const revenueByPackage = [
    { package: 'Basic Plan', revenue: 45230, users: 234, percentage: 36.1 },
    { package: 'Pro Plan', revenue: 52340, users: 156, percentage: 41.7 },
    { package: 'Premium Plan', revenue: 27860, users: 89, percentage: 22.2 }
  ];

  const getGrowthColor = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    if (growth > 0) return 'text-green-400';
    if (growth < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGrowthIcon = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
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
            <h1 className="text-3xl font-bold text-white gradient-text">Analytics Dashboard</h1>
            <p className="text-white/60 mt-2">Comprehensive platform analytics and performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-transparent border-accent/30 text-accent hover:bg-accent/10">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analyticsStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Users</p>
                  <p className="text-2xl font-bold text-white">{analyticsStats.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.3% from last month
                  </div>
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
                  <p className="text-sm text-white/60">Revenue</p>
                  <p className="text-2xl font-bold text-white">${analyticsStats.revenue.toLocaleString()}</p>
                  <div className="flex items-center text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">{analyticsStats.conversionRate}%</p>
                  <div className="flex items-center text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Growth Chart */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              User Growth & Revenue
            </CardTitle>
            <CardDescription>
              Monthly user growth and revenue trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userGrowth.map((data, index) => {
                const previousData = index > 0 ? userGrowth[index - 1] : data;
                const userGrowthPercent = index > 0 ? ((data.users - previousData.users) / previousData.users) * 100 : 0;
                const revenueGrowthPercent = index > 0 ? ((data.revenue - previousData.revenue) / previousData.revenue) * 100 : 0;
                
                return (
                  <div key={data.month} className="glass-subtle rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{data.month}</h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-white/60">Users</div>
                          <div className="text-lg font-bold text-white">{data.users.toLocaleString()}</div>
                          <div className={`flex items-center text-xs ${getGrowthColor(data.users, previousData.users)}`}>
                            {getGrowthIcon(data.users, previousData.users)}
                            <span className="ml-1">{userGrowthPercent > 0 ? '+' : ''}{userGrowthPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">Revenue</div>
                          <div className="text-lg font-bold text-white">${data.revenue.toLocaleString()}</div>
                          <div className={`flex items-center text-xs ${getGrowthColor(data.revenue, previousData.revenue)}`}>
                            {getGrowthIcon(data.revenue, previousData.revenue)}
                            <span className="ml-1">{revenueGrowthPercent > 0 ? '+' : ''}{revenueGrowthPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.users / Math.max(...userGrowth.map(d => d.users))) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages & Device Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" />
                Top Pages
              </CardTitle>
              <CardDescription>
                Most visited pages and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={page.page} className="glass-subtle rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-accent">#{index + 1}</span>
                        </div>
                        <span className="font-semibold text-white">{page.page}</span>
                      </div>
                      <span className="text-sm text-white/60">{page.views.toLocaleString()} views</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                      <div>
                        <span className="font-medium">Unique Visitors:</span> {page.uniqueVisitors}
                      </div>
                      <div>
                        <span className="font-medium">Avg. Time:</span> {page.avgTime}
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-1 mt-2">
                      <div 
                        className="bg-gradient-to-r from-accent to-primary h-1 rounded-full transition-all duration-500"
                        style={{ width: `${(page.views / Math.max(...topPages.map(p => p.views))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-accent" />
                Device Statistics
              </CardTitle>
              <CardDescription>
                User device distribution and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceStats.map((device) => (
                  <div key={device.device} className="glass-subtle rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{device.device}</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{device.percentage}%</div>
                        <div className="text-sm text-white/60">{device.users} users</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Package */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Revenue by Package
            </CardTitle>
            <CardDescription>
              Revenue breakdown by subscription packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByPackage.map((pkg) => (
                <div key={pkg.package} className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pkg.package}</h3>
                      <p className="text-sm text-white/60">{pkg.users} subscribers</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">${pkg.revenue.toLocaleString()}</div>
                      <div className="text-sm text-white/60">{pkg.percentage}% of total</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${pkg.percentage}%` }}
                    />
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
