'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminFallbackPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorId = searchParams.get('errorId');

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred in the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Error:</strong> {error}
              </p>
              {errorId && (
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Error ID:</strong> {errorId}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button variant="outline" onClick={handleGoBack} className="w-full">
              Go Back
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/dashboard/admins">
                <Home className="mr-2 h-4 w-4" />
                Return to Admin Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If this error persists, please contact technical support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}