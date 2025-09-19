'use client';

import { useUser } from '@clerk/nextjs';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import ChangePhotoForm from '@/components/settings/ChangePhotoForm';
import ChangeUsernameForm from '@/components/settings/ChangeUsernameForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Globe, Lock, Palette, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Use Clerk user data
  const profileData = {
    username: user.username || user.firstName?.toLowerCase() || 'user',
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    avatarUrl: user.imageUrl,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your profile picture, username, and other personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChangePhotoForm
              currentAvatarUrl={profileData.avatarUrl}
              userName={profileData.fullName}
            />
            <ChangeUsernameForm
              currentUsername={profileData.username}
              userEmail={profileData.email}
            />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm userEmail={profileData.email} />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for trading signals
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for urgent market alerts
                </p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS for critical trading alerts
                </p>
              </div>
              <Switch id="sms-notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for better visibility in low light
                </p>
              </div>
              <Switch id="dark-mode" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-view">Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Show more information in a condensed layout
                </p>
              </div>
              <Switch id="compact-view" />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Set your preferred language and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  defaultValue="utc"
                >
                  <option value="utc">UTC</option>
                  <option value="est">Eastern Time</option>
                  <option value="pst">Pacific Time</option>
                  <option value="cet">Central European Time</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}