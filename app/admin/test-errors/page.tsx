'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Bug, 
  Clock, 
  Database, 
  Settings, 
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import useAdminErrorHandler from '@/hooks/useAdminErrorHandler';

// Component that throws an error
function ErrorComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Simulated admin panel JavaScript error');
  }
  return <div className="text-green-400">Component loaded successfully!</div>;
}

// Component that simulates timeout
function TimeoutComponent({ shouldTimeout }: { shouldTimeout: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (shouldTimeout) {
      setIsLoading(true);
      // Simulate a long-running operation that never completes
      const timer = setTimeout(() => {
        // This would normally complete, but we'll make it hang
        console.log('Operation would complete here, but we simulate timeout');
      }, 50000); // Very long timeout to simulate hang
      
      return () => clearTimeout(timer);
    }
  }, [shouldTimeout]);

  if (shouldTimeout && isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
        <span className="text-yellow-400">Loading indefinitely...</span>
      </div>
    );
  }

  return <div className="text-green-400">Component loaded normally!</div>;
}

export default function AdminTestErrorsPage() {
  const [errorScenario, setErrorScenario] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
  }>>([]);

  const {
    isLoading,
    hasError,
    errorCount,
    lastError,
    retryCount,
    maxRetries,
    canRetry,
    handleError,
    retry,
    resetError
  } = useAdminErrorHandler({
    enabled: true,
    maxRetries: 2, // Lower for testing
    retryDelay: 1000,
    timeoutThreshold: 5000, // Shorter timeout for testing
    enableGlobalErrorHandler: true,
    enableTimeoutDetection: true,
    fallbackUrl: '/admin/fallback'
  });

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }]);
  };

  const runErrorTests = async () => {
    setTestResults([]);
    resetError();

    // Test 1: JavaScript Error
    addTestResult('JavaScript Error', 'pending', 'Testing error boundary...');
    try {
      setErrorScenario('js-error');
      setTimeout(() => {
        addTestResult('JavaScript Error', 'error', 'Error boundary should catch this');
      }, 500);
    } catch (error) {
      addTestResult('JavaScript Error', 'error', `Caught: ${error}`);
    }

    // Test 2: Network Error
    setTimeout(async () => {
      addTestResult('Network Error', 'pending', 'Testing API failure...');
      try {
        await fetch('/api/admin/nonexistent-endpoint');
        addTestResult('Network Error', 'success', 'Unexpected success');
      } catch (error) {
        addTestResult('Network Error', 'error', 'Network error simulated');
      }
    }, 1000);

    // Test 3: Timeout Simulation
    setTimeout(() => {
      addTestResult('Timeout Test', 'pending', 'Testing timeout detection...');
      setErrorScenario('timeout');
      
      setTimeout(() => {
        addTestResult('Timeout Test', 'error', 'Timeout should be detected');
      }, 6000);
    }, 2000);

    // Test 4: Promise Rejection
    setTimeout(() => {
      addTestResult('Promise Rejection', 'pending', 'Testing unhandled promise rejection...');
      Promise.reject(new Error('Simulated admin panel promise rejection'));
      
      setTimeout(() => {
        addTestResult('Promise Rejection', 'error', 'Promise rejection should be caught');
      }, 500);
    }, 3000);
  };

  const simulateCriticalError = () => {
    handleError(new Error('CRITICAL: Database connection lost'), {
      componentStack: 'AdminTestErrorsPage > simulateCriticalError'
    });
  };

  const testHealthEndpoint = async () => {
    addTestResult('Health Check', 'pending', 'Testing admin health endpoint...');
    
    try {
      const response = await fetch('/api/admin/health');
      const data = await response.json();
      
      if (response.ok && data.success) {
        addTestResult('Health Check', 'success', `Status: ${data.status}`);
      } else {
        addTestResult('Health Check', 'error', `Health check failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addTestResult('Health Check', 'error', `Network error: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              Admin Error <span className="gradient-text">Testing</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Test admin panel error handling and fallback mechanisms
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            <Bug className="h-3 w-3 mr-1" />
            Test Environment
          </Badge>
        </div>
      </div>

      {/* Error Handler Status */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            Error Handler Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Has Error</div>
              <Badge variant="outline" className={hasError ? 'text-red-400 border-red-500/30' : 'text-green-400 border-green-500/30'}>
                {hasError ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Error Count</div>
              <Badge variant="outline">{errorCount}</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Retry Count</div>
              <Badge variant="outline">{retryCount}/{maxRetries}</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Can Retry</div>
              <Badge variant="outline" className={canRetry ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}>
                {canRetry ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          
          {lastError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-sm text-red-400 font-medium">Last Error:</div>
              <div className="text-sm text-muted-foreground font-mono">{lastError}</div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {canRetry && (
              <Button onClick={retry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button onClick={resetError} variant="outline" size="sm">
              Reset Error State
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Automated Error Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Run a series of error scenarios to test the fallback system.
            </p>
            <Button onClick={runErrorTests} className="w-full">
              <Bug className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Critical Error Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Simulate a critical error that should trigger immediate fallback.
            </p>
            <Button onClick={simulateCriticalError} variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Critical Error
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Health Check Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test the admin health endpoint connectivity.
            </p>
            <Button onClick={testHealthEndpoint} variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Test Health Check
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Components */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Test Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">JavaScript Error Component:</div>
              <div className="p-3 bg-muted/20 rounded-lg">
                <ErrorComponent shouldError={errorScenario === 'js-error'} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Timeout Component:</div>
              <div className="p-3 bg-muted/20 rounded-lg">
                <TimeoutComponent shouldTimeout={errorScenario === 'timeout'} />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setErrorScenario('js-error')} 
              size="sm" 
              variant="outline"
            >
              Trigger JS Error
            </Button>
            <Button 
              onClick={() => setErrorScenario('timeout')} 
              size="sm" 
              variant="outline"
            >
              Trigger Timeout
            </Button>
            <Button 
              onClick={() => setErrorScenario(null)} 
              size="sm" 
              variant="outline"
            >
              Clear Errors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                  <div className="mt-0.5">
                    {result.status === 'pending' && <Clock className="h-4 w-4 text-yellow-400" />}
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      result.status === 'success' ? 'text-green-400 border-green-500/30' :
                      result.status === 'error' ? 'text-red-400 border-red-500/30' :
                      'text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Expected Behaviors:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Error boundary catches JavaScript errors</li>
                <li>• Timeout detection redirects after 5 seconds</li>
                <li>• Critical errors trigger immediate fallback</li>
                <li>• Retry mechanism attempts recovery</li>
                <li>• Authentication state is preserved</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Fallback Triggers:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum retry attempts reached</li>
                <li>• Multiple consecutive timeouts</li>
                <li>• Critical system errors detected</li>
                <li>• Network connectivity failures</li>
                <li>• Database connection issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}