# Supabase Email Configuration Guide

## Overview
This guide explains how to configure Supabase to send password reset emails for your member dashboard application.

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`

## Step 1: Configure Supabase Environment Variables

Update your `.env.local` file with your actual Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

To find these values:
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings > API
4. Copy the values for:
   - Project URL
   - anon public key
   - service_role key (keep this secret!)

## Step 2: Configure Email Settings in Supabase

### Enable Email Authentication
1. In Supabase Dashboard, go to **Authentication > Providers**
2. Make sure **Email** is enabled
3. Configure the following settings:
   - Enable email confirmations (optional but recommended)
   - Enable password recovery

### Configure Email Templates
1. Go to **Authentication > Email Templates**
2. Select **Reset Password** template
3. Customize the template if needed. Default template variables:
   - `{{ .ConfirmationURL }}` - The password reset link
   - `{{ .Email }}` - User's email address
   - `{{ .SiteURL }}` - Your application URL

Example template:
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password. Click the link below to set a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 1 hour.</p>
```

### Configure Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:3000/reset-password/confirm
   http://localhost:3001/reset-password/confirm
   https://your-production-domain.com/reset-password/confirm
   ```
3. Set **Site URL** to your application's base URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`

## Step 3: Configure SMTP (Optional - for Custom Email Provider)

By default, Supabase uses their built-in email service (limited to 3 emails/hour for free tier).

To use a custom SMTP provider:
1. Go to **Project Settings > Auth**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Configure your SMTP provider details:
   - Host (e.g., smtp.sendgrid.net)
   - Port (usually 587 for TLS)
   - Username
   - Password
   - Sender email
   - Sender name

Popular SMTP providers:
- SendGrid
- Mailgun
- Amazon SES
- Postmark
- Resend

## Step 4: Test the Password Reset Flow

### Development Testing
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/reset-password`

3. Enter an email address

4. Check the response:
   - **If Supabase is configured**: You'll see "Password reset link sent! Please check your email."
   - **If Supabase is NOT configured**: You'll see a development OTP code on screen

### Production Testing
1. Create a test user account in Supabase:
   - Go to **Authentication > Users**
   - Click **Add user**
   - Enter email and password

2. Test password reset:
   - Go to `/reset-password`
   - Enter the test user's email
   - Check the email inbox
   - Click the reset link
   - Set a new password

## Troubleshooting

### Common Issues and Solutions

#### 1. "Invalid URL" Error
**Problem**: Supabase client can't connect
**Solution**: 
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure it starts with `https://`
- Check for typos in the project ID

#### 2. No Emails Received
**Problem**: Password reset emails not arriving
**Solutions**:
- Check spam/junk folder
- Verify email is enabled in Supabase Auth settings
- Check email logs in Supabase Dashboard > Logs > Auth
- For free tier: Wait 20 minutes (rate limit: 3 emails/hour)
- Consider setting up custom SMTP

#### 3. "Not authenticated" Error on Password Reset Page
**Problem**: Reset link expired or invalid
**Solutions**:
- Request a new password reset
- Check that redirect URL is configured in Supabase
- Verify the link hasn't expired (default: 1 hour)

#### 4. Development Fallback Active in Production
**Problem**: Still seeing OTP codes instead of emails
**Solution**:
- Verify environment variables are set in production
- Restart your application after updating env vars
- Check server logs for configuration errors

## Security Considerations

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** in client-side code
2. **Use environment variables** for all sensitive configuration
3. **Enable RLS (Row Level Security)** on all database tables
4. **Set appropriate redirect URLs** to prevent open redirects
5. **Configure rate limiting** for password reset requests
6. **Use secure password requirements** (minimum 8 characters)

## Migration from Mock Implementation

The application includes a fallback to mock OTP implementation when Supabase is not configured. This allows development without email setup.

### Features of Mock Implementation:
- Generates 6-digit OTP codes
- Shows OTP in UI for testing
- Stores OTP in memory (not persistent)
- 10-minute expiration time

### To Disable Mock Implementation:
1. Configure Supabase credentials
2. The application automatically detects Supabase and uses email flow
3. Remove or comment out the mock fallback code in production

## Next Steps

After configuring email:
1. Test the complete authentication flow
2. Set up email verification for new signups
3. Configure magic link authentication (optional)
4. Add social auth providers (Google, GitHub, etc.)
5. Implement proper session management
6. Set up database tables and RLS policies

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
