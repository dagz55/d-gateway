'use client';

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OAuthTestPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [user, setUser] = useState<any>(null);
  const [redirectUri, setRedirectUri] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Get redirect URI
        const currentOrigin = window.location.origin;
        setRedirectUri(`${currentOrigin}/auth/callback`);
        
        // Get Supabase URL
        const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        setSupabaseUrl(envUrl);
        
        setStatus('ready');
      } catch (error) {
        console.error('Auth check error:', error);
        setStatus('error');
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Google OAuth Test Page</h1>
      
      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OAuth Configuration Status</CardTitle>
          <CardDescription>Current environment and authentication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {status === 'ready' ? (
              <CheckCircle className="text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="text-red-500" />
            ) : (
              <AlertCircle className="text-yellow-500" />
            )}
            <span>Status: {status}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-semibold">Current Redirect URI:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{redirectUri}</code>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-semibold">Supabase Callback URI:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {supabaseUrl}/auth/v1/callback
                </code>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-semibold">User Status:</p>
                <span>{user ? `Signed in as ${user.email}` : 'Not signed in'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required URIs Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Required Google Console URIs</CardTitle>
          <CardDescription>
            Add these to your Google Cloud Console OAuth 2.0 Client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-2">Authorized redirect URIs:</p>
            <ul className="space-y-1">
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                  {supabaseUrl}/auth/v1/callback
                </code>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                  http://localhost:3000/auth/callback
                </code>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                  http://localhost:3001/auth/callback
                </code>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                  http://localhost:3002/auth/callback
                </code>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                  https://your-app.vercel.app/auth/callback
                </code>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test OAuth Sign In</CardTitle>
          <CardDescription>
            Test the Google OAuth flow with your current configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ Successfully signed in!</p>
                <p className="text-sm text-green-600 mt-1">Email: {user.email}</p>
                <p className="text-sm text-green-600">ID: {user.id}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <GoogleSignInButton className="w-full" />
              <p className="text-sm text-gray-500 text-center">
                Click the button above to test Google OAuth sign in
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps if OAuth is not working</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Console</a></li>
            <li>Select your project or create a new one</li>
            <li>Navigate to APIs & Services → Credentials</li>
            <li>Click on your OAuth 2.0 Client ID (or create one)</li>
            <li>Add all the redirect URIs listed above</li>
            <li>Copy your Client ID and Client Secret</li>
            <li>Go to <a href={`${supabaseUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Supabase Dashboard</a></li>
            <li>Navigate to Authentication → Providers → Google</li>
            <li>Enable Google and paste your credentials</li>
            <li>Save and wait 5-10 minutes for propagation</li>
            <li>Clear browser cache and cookies</li>
            <li>Try signing in again</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}