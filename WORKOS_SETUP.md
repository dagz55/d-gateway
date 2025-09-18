# WorkOS AuthKit + Supabase Integration Setup Guide

This guide will help you set up WorkOS AuthKit as a Supabase third-party auth provider for the Zignal application, combining enterprise authentication with Supabase's database capabilities.

## Prerequisites

1. A WorkOS account
2. Your WorkOS API Key and Client ID
3. WorkOS AuthKit activated in your WorkOS Dashboard
4. A Supabase account and project
5. Your Supabase URL and Anon Key

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# WorkOS Configuration
WORKOS_API_KEY=sk_example_123456789
WORKOS_CLIENT_ID=client_123456789
WORKOS_COOKIE_PASSWORD=your_32_character_password_here
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/workos/callback
WORKOS_LOGIN_ENDPOINT=http://localhost:3000/api/auth/workos/login
WORKOS_LOGOUT_REDIRECT_URI=http://localhost:3000/
WORKOS_ISSUER_URL=https://api.workos.com/user_management/client_YOUR_CLIENT_ID

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Generate Cookie Password

The `WORKOS_COOKIE_PASSWORD` must be exactly 32 characters long. Generate one using:

```bash
openssl rand -base64 24
```

## WorkOS Dashboard Configuration

### 1. Configure Redirect URIs

In your WorkOS Dashboard, go to the "Redirects" section and add:

- **Redirect URI**: `http://localhost:3000/api/auth/workos/callback` (for development)
- **Logout Redirect URI**: `http://localhost:3000/` (for development)

For production, replace `localhost:3000` with your production domain.

### 2. Configure Login Endpoint

In the "Redirects" section, set:

- **Login Endpoint**: `http://localhost:3000/api/auth/workos/login`

### 3. Set up JWT Template

In your WorkOS Dashboard, go to Authentication → Sessions and create a JWT template:

```json
{
  "sub": "{{ user.id }}",
  "email": "{{ user.email }}",
  "role": "authenticated",
  "user_role": "{{ user.role }}",
  "aud": "authenticated",
  "exp": "{{ exp }}",
  "iat": "{{ iat }}",
  "iss": "https://api.workos.com/user_management/client_YOUR_CLIENT_ID"
}
```

Replace `YOUR_CLIENT_ID` with your actual WorkOS Client ID.

## Supabase Dashboard Configuration

### 1. Add WorkOS as Third-Party Auth Provider

In your Supabase Dashboard, go to Authentication → Third-party providers and add WorkOS:

- **Provider**: WorkOS
- **Issuer URL**: `https://api.workos.com/user_management/client_YOUR_CLIENT_ID`

Replace `YOUR_CLIENT_ID` with your actual WorkOS Client ID.

## Testing the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign in with WorkOS" to test the authentication flow

4. You should be redirected to WorkOS AuthKit, then back to your dashboard

## Features Implemented

- ✅ WorkOS AuthKit integration
- ✅ Supabase third-party auth provider setup
- ✅ Encrypted session management
- ✅ Protected route middleware
- ✅ Login/logout endpoints
- ✅ User context provider with Supabase integration
- ✅ Professional UI components
- ✅ JWT template configuration
- ✅ Access token management for Supabase APIs

## Architecture

The implementation follows WorkOS + Supabase integration best practices:

- **Authentication**: WorkOS AuthKit handles all user authentication
- **Database**: Supabase provides database with RLS policies
- **Integration**: WorkOS access tokens authenticate with Supabase APIs
- **Session Management**: Encrypted cookies with automatic refresh
- **Middleware**: Route protection with WorkOS session validation
- **Benefits**: Enterprise auth + Supabase database features

## Troubleshooting

### Common Issues

1. **"Missing required WorkOS environment variables"**
   - Ensure all required environment variables are set
   - Check that `WORKOS_COOKIE_PASSWORD` is exactly 32 characters

2. **"Invalid WorkOS URL format"**
   - Verify your WorkOS API key and client ID are correct
   - Check that AuthKit is enabled in your WorkOS dashboard

3. **Redirect URI mismatch**
   - Ensure the redirect URI in your WorkOS dashboard matches your environment variable
   - Check that the callback endpoint is accessible

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed logs for troubleshooting authentication issues.

## Production Deployment

1. Update environment variables with production URLs
2. Configure production redirect URIs in WorkOS dashboard
3. Ensure HTTPS is enabled for all URLs
4. Test the complete authentication flow

## Security Notes

- WorkOS handles all password security and encryption
- Sessions are automatically encrypted with your cookie password
- No sensitive data is stored in your application
- All authentication is handled by WorkOS's secure infrastructure
