'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/browserClient';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CleanSessionPage() {
  const [status, setStatus] = useState<'cleaning' | 'success' | 'error'>('cleaning');
  const [message, setMessage] = useState('Cleaning session data...');
  const router = useRouter();

  useEffect(() => {
    const cleanSession = async () => {
      try {
        setMessage('Signing out and clearing session data...');
        
        // Sign out from Supabase
        await supabase().auth.signOut();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        });

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        setStatus('success');
        setMessage('Session cleaned successfully! Redirecting...');

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error) {
        console.error('Error cleaning session:', error);
        setStatus('error');
        setMessage('Failed to clean session. Please try again.');
      }
    };

    cleanSession();
  }, [router]);

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0F1F]">
      <Card className="w-full max-w-md glass border-[#33E1DA]/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#EAF2FF] flex items-center justify-center gap-2">
            {status === 'cleaning' && <Loader2 className="h-6 w-6 animate-spin text-[#33E1DA]" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-400" />}
            {status === 'error' && <AlertCircle className="h-6 w-6 text-red-400" />}
            Session Cleanup
          </CardTitle>
          <CardDescription className="text-[#EAF2FF]/70">
            {status === 'cleaning' && 'Clearing large session data to fix header size issue'}
            {status === 'success' && 'Session data cleared successfully'}
            {status === 'error' && 'There was an issue clearing the session'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#EAF2FF]/80 text-center">
            {message}
          </p>
          
          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-[#EAF2FF]/60 text-center">
                This error occurs when request headers become too large. We're clearing your session data to resolve this issue.
              </p>
              <Button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90"
              >
                Try Again
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-green-400">
                You will be redirected to the home page shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
