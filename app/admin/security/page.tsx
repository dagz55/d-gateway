import { requireAdmin } from '@/lib/clerk-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Key, Users, Activity, Clock, AlertCircle, Settings } from 'lucide-react';

export default async function AdminSecurityPage() {
  // Require admin authentication
  await requireAdmin();

  // Mock data for security logs and stats
  const securityStats = {
    totalThreats: 3,
    blockedAttempts: 1247,
    activeSessions: 89,
    lastSecurityScan: '2024-01-15T10:30:00Z',
    securityScore: 95,
    twoFactorEnabled: true,
    sslEnabled: true
  };

  const securityLogs = [
    {
      id: 1,
      type: 'LOGIN_ATTEMPT',
      severity: 'LOW',
      message: 'Successful login from 192.168.1.100',
      user: 'admin@zignals.com',
      ip: '192.168.1.100',
      timestamp: '2024-01-15T12:30:00Z',
      status: 'SUCCESS'
    },
    {
      id: 2,
      type: 'FAILED_LOGIN',
      severity: 'MEDIUM',
      message: 'Failed login attempt with invalid credentials',
      user: 'unknown@example.com',
      ip: '203.45.67.89',
      timestamp: '2024-01-15T12:25:00Z',
      status: 'BLOCKED'
    },
    {
      id: 3,
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'HIGH',
      message: 'Multiple failed login attempts detected',
      user: 'admin@zignals.com',
      ip: '45.67.89.123',
      timestamp: '2024-01-15T12:20:00Z',
      status: 'BLOCKED'
    },
    {
      id: 4,
      type: 'PASSWORD_CHANGE',
      severity: 'LOW',
      message: 'Password changed successfully',
      user: 'user@example.com',
      ip: '192.168.1.50',
      timestamp: '2024-01-15T12:15:00Z',
      status: 'SUCCESS'
    },
    {
      id: 5,
      type: 'API_ACCESS',
      severity: 'LOW',
      message: 'API access from authorized application',
      user: 'system',
      ip: '10.0.0.5',
      timestamp: '2024-01-15T12:10:00Z',
      status: 'SUCCESS'
    }
  ];

  const activeSessions = [
    {
      id: 1,
      user: 'admin@zignals.com',
      ip: '192.168.1.100',
      location: 'New York, US',
      device: 'Chrome on Windows',
      lastActivity: '2024-01-15T12:30:00Z',
      status: 'ACTIVE'
    },
    {
      id: 2,
      user: 'user@example.com',
      ip: '203.45.67.89',
      location: 'London, UK',
      device: 'Safari on macOS',
      lastActivity: '2024-01-15T12:25:00Z',
      status: 'ACTIVE'
    },
    {
      id: 3,
      user: 'trader@zignals.com',
      ip: '45.67.89.123',
      location: 'Tokyo, JP',
      device: 'Firefox on Linux',
      lastActivity: '2024-01-15T12:20:00Z',
      status: 'IDLE'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'CRITICAL': return 'bg-red-600/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'BLOCKED': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'IDLE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
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
            <h1 className="text-3xl font-bold text-white gradient-text">Security Center</h1>
            <p className="text-white/60 mt-2">Monitor security logs, threats, and system security status</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-transparent border-accent/30 text-accent hover:bg-accent/10">
              <Shield className="w-4 h-4 mr-2" />
              Run Security Scan
            </Button>
            <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Threats</p>
                  <p className="text-2xl font-bold text-white">{securityStats.totalThreats}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Blocked Attempts</p>
                  <p className="text-2xl font-bold text-white">{securityStats.blockedAttempts.toLocaleString()}</p>
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
                  <p className="text-sm text-white/60">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">{securityStats.activeSessions}</p>
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
                  <p className="text-sm text-white/60">Security Score</p>
                  <p className="text-2xl font-bold text-white">{securityStats.securityScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Two-Factor Authentication</span>
                <Badge className={securityStats.twoFactorEnabled ? getStatusColor('SUCCESS') : getStatusColor('BLOCKED')}>
                  {securityStats.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">SSL/TLS Encryption</span>
                <Badge className={securityStats.sslEnabled ? getStatusColor('SUCCESS') : getStatusColor('BLOCKED')}>
                  {securityStats.sslEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Rate Limiting</span>
                <Badge className={getStatusColor('SUCCESS')}>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">IP Whitelisting</span>
                <Badge className={getStatusColor('SUCCESS')}>Configured</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/60 mb-2">
                Last security scan: {new Date(securityStats.lastSecurityScan).toLocaleString()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Failed login attempts (24h)</span>
                  <span className="text-red-400">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Successful logins (24h)</span>
                  <span className="text-green-400">156</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">API requests (24h)</span>
                  <span className="text-blue-400">2,847</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Logs */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Security Logs
            </CardTitle>
            <CardDescription>
              Monitor security events and potential threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="glass-subtle rounded-xl p-4 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <span className="text-sm font-semibold text-white">
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-white/80 mb-2">
                    {log.message}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex items-center space-x-4">
                      <span>User: {log.user}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Monitor current user sessions and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="glass-subtle rounded-xl p-4 hover:glass-light transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-white">
                        {session.user}
                      </span>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-white/60">
                      Last activity: {new Date(session.lastActivity).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                    <div>
                      <span className="font-medium">IP Address:</span> {session.ip}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {session.location}
                    </div>
                    <div>
                      <span className="font-medium">Device:</span> {session.device}
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                      Terminate Session
                    </Button>
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
