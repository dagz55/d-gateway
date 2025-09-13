'use client';

import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import ChangePhotoForm from '@/components/settings/ChangePhotoForm';
import ChangeUsernameForm from '@/components/settings/ChangeUsernameForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Globe, Lock, Palette, Shield } from 'lucide-react';

export default function SettingsPage() {
  // Mock profile data to avoid API calls
  const profile = {
    username: 'user123',
    fullName: 'John Doe',
    avatarUrl: undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and security options.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account credentials and basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ChangePhotoForm />
              <ChangeUsernameForm currentUsername={profile?.username || ''} />
            </div>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive notifications via email
                </div>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trading-alerts">Trading Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified about trading opportunities
                </div>
              </div>
              <Switch id="trading-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Receive price movement notifications
                </div>
              </div>
              <Switch id="price-alerts" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="login-alerts">Login Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified of new login attempts
                </div>
              </div>
              <Switch id="login-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-sharing">Data Sharing</Label>
                <div className="text-sm text-muted-foreground">
                  Allow data sharing for analytics and improvements
                </div>
              </div>
              <Switch id="data-sharing" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </div>
              </div>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-view">Compact View</Label>
                <div className="text-sm text-muted-foreground">
                  Use a more compact layout for better space utilization
                </div>
              </div>
              <Switch id="compact-view" />
            </div>
          </CardContent>
        </Card>

        {/* Trading Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Trading Preferences
            </CardTitle>
            <CardDescription>Configure your trading environment and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-trading">Auto Trading</Label>
                <div className="text-sm text-muted-foreground">
                  Enable automated trading based on signals
                </div>
              </div>
              <Switch id="auto-trading" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="risk-management">Risk Management</Label>
                <div className="text-sm text-muted-foreground">
                  Enable automatic risk management features
                </div>
              </div>
              <Switch id="risk-management" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-effects">Sound Effects</Label>
                <div className="text-sm text-muted-foreground">
                  Play sounds for trading notifications
                </div>
              </div>
              <Switch id="sound-effects" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
