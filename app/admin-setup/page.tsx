'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMakeAdmin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/make-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Refresh the page after 2 seconds to update the user's role
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Failed to assign admin role');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const adminEmails = ['dagz55@gmail.com', 'admin@zignals.org'];
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const isEligibleForAdmin = userEmail && adminEmails.includes(userEmail);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="text-sm text-gray-600">
                <p><strong>Current User:</strong> {userEmail}</p>
                <p><strong>User ID:</strong> {user.id}</p>
              </div>

              {isEligibleForAdmin ? (
                <>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your email is authorized for admin access. Click below to assign admin role.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up admin...
                      </>
                    ) : (
                      'Make Admin'
                    )}
                  </Button>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your email ({userEmail}) is not authorized for admin access.
                    Only the following emails can be assigned admin role:
                    <ul className="mt-2 ml-4 list-disc">
                      {adminEmails.map(email => (
                        <li key={email}>{email}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Success!</strong> {result.message}</p>
                      <p>Total admins: {result.totalAdmins}</p>
                      {result.results && (
                        <div className="text-xs">
                          {result.results.map((r: any, i: number) => (
                            <div key={i}>
                              {r.email}: {r.status.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-green-600">Refreshing page...</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to access admin setup.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}