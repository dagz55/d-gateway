'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Home, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import DashboardLink from '@/components/auth/DashboardLink';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class AdminErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;
  
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `admin_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    this.logAdminError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Redirect to admin fallback after a delay if too many errors
    if (this.retryCount >= this.maxRetries) {
      setTimeout(() => {
        window.location.href = '/admin/fallback';
      }, 2000);
    }
  }

  private async logAdminError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorId: this.state.errorId
      };

      // Log to console for development
      console.error('Admin Panel Error:', errorData);

      // Send error to logging endpoint
      await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => console.warn('Failed to log admin error:', err));

    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  }

  private handleRetry = () => {
    this.retryCount++;
    
    if (this.retryCount >= this.maxRetries) {
      // Redirect to fallback page
      window.location.href = '/admin/fallback';
      return;
    }

    // Reset error state to retry
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });

    // Force re-render
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  private handleFallbackRedirect = () => {
    window.location.href = '/admin/fallback';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default admin error UI
      return (
        <div className="min-h-screen dashboard-bg flex items-center justify-center p-6">
          <Card className="glass border-destructive/50 max-w-2xl w-full">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl text-destructive">
                  Admin Panel Error
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  The admin panel has encountered an error and cannot display properly.
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">
                  Error ID: {this.state.errorId}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Attempt: {this.retryCount + 1}/{this.maxRetries + 1}
                </Badge>
              </div>

              {this.props.showErrorDetails && this.state.error && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Error Details:</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button 
                  onClick={this.handleRetry}
                  disabled={this.retryCount >= this.maxRetries}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Retry Admin Panel'}
                </Button>
                
                <Button 
                  onClick={this.handleFallbackRedirect}
                  variant="outline" 
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Fallback
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h4 className="font-medium text-sm mb-3 text-center">Alternative Options</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <DashboardLink />
                  
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/admin/system-status">
                      <Settings className="h-4 w-4 mr-2" />
                      System Status
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  The error has been logged for debugging. If the problem persists, contact system administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  return function WrappedComponent(props: P) {
    return (
      <AdminErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };
}

export default AdminErrorBoundary;
