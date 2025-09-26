'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Settings, 
  Shield, 
  Users, 
  Activity,
  CheckCircle,
  Clock,
  Database,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SystemStatus {
  database: 'online' | 'offline' | 'degraded';
  auth: 'online' | 'offline' | 'degraded';
  api: 'online' | 'offline' | 'degraded';
  admin: 'online' | 'offline' | 'degraded';
}

export default function AdminFallbackPage() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    auth: 'online',
    api: 'online',
    admin: 'degraded'
  });
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have error information from the redirect
    const urlParams = new URLSearchParams(window.location.search);
    const errorId = urlParams.get('errorId');
    const errorMsg = urlParams.get('error');
    
    if (errorMsg) {
      setLastError(decodeURIComponent(errorMsg));
    }

    // Perform basic system status checks
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    const newStatus: SystemStatus = { ...systemStatus };

    try {
      // Test basic API connectivity
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-store' 
      });
      newStatus.api = response.ok ? 'online' : 'degraded';
    } catch (error) {
      newStatus.api = 'offline';
    }

    try {
      // Test auth service
      const authResponse = await fetch('/api/auth/session', { 
        method: 'GET',
        cache: 'no-store' 
      });
      newStatus.auth = authResponse.ok ? 'online' : 'degraded';
    } catch (error) {
      newStatus.auth = 'offline';
    }

    setSystemStatus(newStatus);
  };

  const handleRetryAdmin = async () => {
    setIsRetrying(true);
    
    try {
      // Wait a moment for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if admin panel is accessible
      const response = await fetch('/api/admin/health', { 
        method: 'GET',
        cache: 'no-store' 
      });

      if (response.ok) {
        // Redirect back to admin panel
        router.push('/admin');
      } else {
        // Still having issues, stay on fallback page
        alert('Admin panel is still experiencing issues. Please try again later or contact support.');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Failed to reconnect to admin panel. Please check your connection and try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'degraded': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'offline': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <Clock className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Admin Fallback Mode
            </Badge>
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-12 w-12 text-yellow-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                Admin Panel <span className="gradient-text">Unavailable</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The admin panel is temporarily experiencing issues. You can use the alternative options below 
                or wait for the system to recover.
              </p>
            </div>
          </div>
        </div>

        {/* Error Information */}
        {lastError && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <strong className="text-yellow-400">Last Error:</strong>
                  <p className="text-sm text-muted-foreground mt-1">{lastError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card className="glass border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.database)}
                <span className="text-sm text-foreground">Database</span>
                <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.database)}`}>
                  {systemStatus.database}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.auth)}
                <span className="text-sm text-foreground">Auth Service</span>
                <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.auth)}`}>
                  {systemStatus.auth}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.api)}
                <span className="text-sm text-foreground">API Gateway</span>
                <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.api)}`}>
                  {systemStatus.api}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.admin)}
                <span className="text-sm text-foreground">Admin Panel</span>
                <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.admin)}`}>
                  {systemStatus.admin}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Button 
            onClick={handleRetryAdmin}
            disabled={isRetrying}
            size="lg"
            className="w-full h-16"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking Admin Panel...' : 'Retry Admin Panel'}
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full h-16">
            <Link href="/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Go to Member Dashboard
            </Link>
          </Button>
        </div>

        {/* Alternative Admin Options */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mb-8">
          
          {/* Quick User Management */}
          <Card className="glass border-border/50 hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  User Management
                </CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-lg font-bold text-foreground">Limited Access</div>
                <div className="text-sm text-muted-foreground">
                  Basic user operations via API endpoints
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/users/basic">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Basic View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card className="glass border-border/50 hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Monitor
                </CardTitle>
                <Activity className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-lg font-bold text-foreground">Health Check</div>
                <div className="text-sm text-muted-foreground">
                  Monitor system components and services
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/system-status">
                    <Settings className="h-4 w-4 mr-2" />
                    View Status
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="glass border-border/50 hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Emergency Mode
                </CardTitle>
                <Shield className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-lg font-bold text-foreground">Safe Mode</div>
                <div className="text-sm text-muted-foreground">
                  Essential admin functions only
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/emergency">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Console
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Information */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Troubleshooting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Common Causes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• JavaScript runtime errors</li>
                  <li>• Network connectivity issues</li>
                  <li>• Database connection problems</li>
                  <li>• Authentication service disruption</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Recommended Actions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Wait 1-2 minutes and retry</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Contact support if issue persists</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                This page preserves your admin authentication while the main panel recovers.
                All error details have been logged for debugging purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}