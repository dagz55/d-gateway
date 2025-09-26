import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Server, Database, Activity, DollarSign, Signal } from 'lucide-react';

export default function SystemStatisticsPage() {
  const stats = [
    { title: 'Total Users', value: '2,543', change: '+12%', trend: 'up', icon: Users, color: 'blue' },
    { title: 'Active Signals', value: '847', change: '+8%', trend: 'up', icon: Signal, color: 'green' },
    { title: 'Revenue', value: '$12,450', change: '+15%', trend: 'up', icon: DollarSign, color: 'emerald' },
    { title: 'Server Load', value: '64%', change: '-3%', trend: 'down', icon: Server, color: 'orange' },
    { title: 'Database Queries', value: '1.2M', change: '+22%', trend: 'up', icon: Database, color: 'purple' },
    { title: 'API Requests', value: '45.8K', change: '+18%', trend: 'up', icon: Activity, color: 'pink' },
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    }[color] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg">
          <BarChart3 className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Statistics</h1>
          <p className="text-muted-foreground">Real-time analytics and platform performance metrics</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${getColorClasses(stat.color, 'bg')} border ${getColorClasses(stat.color, 'border')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${getColorClasses(stat.color, 'text')}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className={`flex items-center text-xs ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    stat.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart Placeholder */}
        <Card className="bg-background/50 border-border">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] bg-slate-800/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="bg-background/50 border-border">
          <CardHeader>
            <CardTitle className="text-white">System Performance</CardTitle>
            <CardDescription>Real-time system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="text-white">64%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="text-white">78%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Disk Usage</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="bg-background/50 border-border">
        <CardHeader>
          <CardTitle className="text-white">Activity Summary</CardTitle>
          <CardDescription>Recent system events and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">245 new user registrations today</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">System backup completed successfully</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Database optimization completed</p>
                <p className="text-xs text-muted-foreground">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}