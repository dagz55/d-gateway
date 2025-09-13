# Google OAuth Redirect URI Mismatch Fix

## Issue
Error 400: redirect_uri_mismatch when trying to sign in with Google

## Root Cause
The redirect URI configured in Google Cloud Console doesn't match what Supabase is sending.

## Solution Steps

### Step 1: Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vxtalnnjudbogemgmkoe/auth/providers
2. Find the Google provider section
3. Enable Google OAuth if not already enabled
4. Note the Callback URL (it should be: `https://vxtalnnjudbogemgmkoe.supabase.co/auth/v1/callback`)

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one)
5. In the **Authorized redirect URIs** section, add these URIs:

#### For Production (Vercel):
```
https://vxtalnnjudbogemgmkoe.supabase.co/auth/v1/callback
```

#### For Local Development:
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
```

6. **IMPORTANT**: Also add your production domain if you have one:
```
https://your-vercel-app.vercel.app/auth/callback
```

7. Save the changes

### Step 3: Update Supabase with Google Credentials

1. In Google Cloud Console, copy your:
   - Client ID
   - Client Secret

2. Go back to Supabase Dashboard > Authentication > Providers > Google
3. Paste the credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Save the changes

### Step 4: Update Environment Variables

Make sure your `.env.local` has the correct values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vxtalnnjudbogemgmkoe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL (update based on environment)
# For local development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production (update with your actual domain):
# NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Step 5: Update OAuth Button Configuration

The GoogleSignInButton component should specify the redirectTo parameter:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  }
});
```

## Quick Fix Script

Run this script to automatically update your configuration:

```bash
node scripts/fix-google-oauth.js
```

## Testing

1. Clear your browser cookies for localhost
2. Try signing in with Google again
3. You should be redirected properly without errors

## Common Issues and Solutions

### Issue 1: Still getting redirect_uri_mismatch
- Double-check that the URI in Google Console matches EXACTLY (including trailing slashes)
- Wait 5-10 minutes for Google's changes to propagate
- Clear browser cache and cookies

### Issue 2: Works locally but not in production
- Ensure your production URL is added to Google Console
- Update NEXT_PUBLIC_SITE_URL in your production environment variables

### Issue 3: Callback page shows error
- Make sure you have the auth callback route properly configured
- Check that Supabase client is initialized correctly

## Verification Checklist

- [ ] Supabase Dashboard has Google OAuth enabled
- [ ] Google Cloud Console has correct redirect URIs
- [ ] Environment variables are set correctly
- [ ] GoogleSignInButton uses proper redirectTo parameter
- [ ] Auth callback route exists and works
- [ ] Production deployment has updated environment variables

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Auth Patterns](https://nextjs.org/docs/app/building-your-application/authentication)