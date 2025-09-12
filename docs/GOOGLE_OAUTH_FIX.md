# Google OAuth Configuration Fix

## Issue
The Google OAuth authentication is not redirecting properly due to port mismatch and configuration issues.

## Current Setup Status
✅ Google OAuth credentials are configured in `.env.local`
✅ NextAuth API route exists at `/api/auth/[...nextauth]/route.ts`
✅ Auth configuration supports both Google OAuth and credentials
✅ Mock database integration for user storage

## Required Actions

### 1. Update Google Cloud Console Redirect URIs

Since your development server is running on port **3001** (not 3000), you need to update the authorized redirect URIs in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
6. Remove the old URI if present:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Save**

### 2. Environment Variables (Already Updated)
The `.env.local` file has been updated to use the correct port:
```env
NEXTAUTH_URL=http://localhost:3001
```

### 3. Test the Configuration

1. Stop your development server if running
2. Clear your browser cookies for localhost
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Navigate to http://localhost:3001/login
5. Click "Continue with Google"
6. Complete the Google sign-in flow

## Port Management

If port 3000 is being used by another process and you want to use it:

### Option 1: Kill the process using port 3000
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### Option 2: Use a different port permanently
Update `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3001
```

And update Google Cloud Console redirect URI accordingly.

## Troubleshooting

### Error: "redirect_uri_mismatch"
This means the redirect URI in your Google Cloud Console doesn't match exactly. Ensure:
- The port number matches (3001 in this case)
- The path is exactly `/api/auth/callback/google`
- The protocol is `http` for localhost

### Error: "invalid_client" 
Check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` match the values in Google Cloud Console.

### Error: 404 on callback
Ensure the NextAuth API route exists at:
```
src/app/api/auth/[...nextauth]/route.ts
```

## Testing Checklist

- [ ] Google Cloud Console redirect URI updated to port 3001
- [ ] `.env.local` has correct `NEXTAUTH_URL` (port 3001)
- [ ] Development server running on expected port
- [ ] Browser cookies cleared for localhost
- [ ] Google Sign-In button visible on login page
- [ ] OAuth flow completes successfully
- [ ] User is redirected to dashboard after sign-in
- [ ] User profile shows Google account info

## Production Deployment

When deploying to production:

1. Add production redirect URI to Google Cloud Console:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

2. Update production environment variables:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_client_secret
   ```

3. Ensure HTTPS is configured (required for production OAuth)

## Current Implementation Details

### Auth Flow
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. After consent, redirected back to `/api/auth/callback/google`
4. NextAuth processes the callback
5. User profile created/updated in mock database
6. User session established with JWT
7. User redirected to dashboard

### Data Storage
- Google OAuth users are stored in the mock database
- Profile images from Google are saved as `avatarUrl`
- Users are marked as verified by default
- Default values assigned for trading-specific fields

## Support Links
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)