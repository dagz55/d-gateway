'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/providers/supabase-auth-provider';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AuthTestPage() {
  const { supabase, user, session, loading, signOut } = useSupabaseAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const [isLoading, setIsLoading] = useState(false);

  const testSignUp = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User',
            username: `testuser_${Date.now()}`,
          }
        }
      });

      if (error) {
        toast.error(`Sign up failed: ${error.message}`);
      } else {
        toast.success('Sign up successful! Check your email for verification.');
      }
    } catch (error) {
      toast.error('Unexpected error during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
      } else {
        toast.success('Sign in successful!');
      }
    } catch (error) {
      toast.error('Unexpected error during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success('Sign out successful!');
    } catch (error) {
      toast.error('Sign out failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testGetSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      toast.error(`Failed to get session: ${error.message}`);
    } else if (session) {
      toast.success('Session retrieved successfully!');
      console.log('Session:', session);
    } else {
      toast.info('No active session');
    }
  };

  const testRefreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      toast.error(`Failed to refresh session: ${error.message}`);
    } else {
      toast.success('Session refreshed successfully!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading auth state...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Auth Test Page</CardTitle>
          <CardDescription>
            Test various Supabase authentication functions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Auth State */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Current Auth State</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Authenticated:</span>{' '}
                <span className={session ? 'text-green-600' : 'text-red-600'}>
                  {session ? 'Yes' : 'No'}
                </span>
              </div>
              {user && (
                <>
                  <div>
                    <span className="font-medium">User ID:</span> {user.id}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Email Verified:</span>{' '}
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </div>
                </>
              )}
              {session && (
                <div>
                  <span className="font-medium">Session Expires:</span>{' '}
                  {new Date(session.expires_at! * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Test Credentials */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Credentials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Auth Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                onClick={testSignUp}
                disabled={isLoading || !!session}
                variant="outline"
              >
                Test Sign Up
              </Button>
              <Button
                onClick={testSignIn}
                disabled={isLoading || !!session}
                variant="outline"
              >
                Test Sign In
              </Button>
              <Button
                onClick={testSignOut}
                disabled={isLoading || !session}
                variant="outline"
              >
                Test Sign Out
              </Button>
              <Button
                onClick={testGetSession}
                disabled={isLoading}
                variant="outline"
              >
                Get Session
              </Button>
              <Button
                onClick={testRefreshSession}
                disabled={isLoading || !session}
                variant="outline"
              >
                Refresh Session
              </Button>
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
              >
                Go to Login Page
              </Button>
            </div>
          </div>

          {/* Environment Variables Check */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Environment Check</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>{' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}
                </span>
              </div>
              <div>
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2">Testing Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Enter test credentials (or use defaults)</li>
              <li>Click "Test Sign Up" to create a new account</li>
              <li>Check your email for verification link (if email is configured)</li>
              <li>Click "Test Sign In" to authenticate</li>
              <li>Use "Get Session" to verify authentication state</li>
              <li>Click "Test Sign Out" to clear session</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}