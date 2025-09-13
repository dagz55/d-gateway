# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for your member dashboard application.

## Prerequisites

- A Google Cloud Console account
- Your application running on `http://localhost:3000` (for development)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Existing Supabase and NextAuth configuration
NEXT_PUBLIC_SUPABASE_URL=https://vxtalnnjudbogemgmkoe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. You should see a "Continue with Google" button
4. Click the button to test the Google Sign-In flow

## Features Implemented

### ✅ Google Sign-In Button
- Custom Google Sign-In button component with official Google branding
- Loading states and error handling
- Responsive design that matches your UI theme

### ✅ Authentication Flow
- Seamless integration with NextAuth.js
- Automatic user creation for new Google users
- Session management for Google OAuth users

### ✅ User Experience
- "Sign in with Google" prominently displayed on login page
- "Continue with Google" option on signup page
- Clean separation between Google OAuth and traditional credentials

### ✅ Security Features
- Secure token handling
- Proper redirect URL validation
- User data protection following Google's guidelines

## User Benefits

According to [Google's Sign-In documentation](https://www.google.com/account/about/sign-in-with-google/), users get:

- **Faster, safer, easier** sign-in experience
- **Single tap** authentication across all devices
- **Control over connections** and shared information
- **Enhanced security** with Google's trusted infrastructure
- **Familiar experience** across browsers and devices

## Production Deployment

When deploying to production:

1. Update the redirect URI in Google Cloud Console to your production domain
2. Update `NEXTAUTH_URL` environment variable to your production URL
3. Ensure all environment variables are properly set in your production environment

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Cloud Console matches exactly
   - Ensure the URL is `https://yourdomain.com/api/auth/callback/google`

2. **"invalid_client" error**:
   - Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Check that the OAuth consent screen is properly configured

3. **Button not appearing**:
   - Ensure the `GoogleSignInButton` component is properly imported
   - Check that environment variables are loaded correctly

### Debug Steps:

1. Check browser console for any JavaScript errors
2. Verify environment variables are loaded: `console.log(process.env.GOOGLE_CLIENT_ID)`
3. Check NextAuth.js logs for authentication flow issues

## Support

For additional help:
- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Best Practices](https://developers.google.com/identity/sign-in/web/best-practices)
