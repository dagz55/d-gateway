# Vercel Deployment Fix - Clerk Environment Variables

## 🚨 Issue
Vercel deployment is failing with:
```
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
```

## 🔧 Root Cause
The Clerk environment variables are configured locally but not in Vercel's environment variable settings.

## ✅ Solution

### Step 0: Prepare Local Environment Template

1. Copy the provided `.env.example` file to `.env.local` (or `.env.production`) and populate it with your real secrets.
2. Keep these files out of version control—`.gitignore` already excludes `.env*` files.

### Step 1: Configure Environment Variables in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your `zignal-login` project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add the following variables and replace the placeholders with your actual secrets inside Vercel:

#### Required Clerk Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

#### Required Supabase Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### Required Site Configuration:
```
NEXT_PUBLIC_SITE_URL=your_site_url_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
SESSION_SECRET=your_session_secret_here
```

#### Optional API Keys:
```
COINGECKO_API_KEY=your_coingecko_api_key_here
ALLOWED_ADMIN_EMAILS=admin@zignals.org,dagz55@gmail.com
```

### Step 2: Environment Variable Settings

For each environment variable:
- **Name**: The exact variable name (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- **Value**: The corresponding value
- **Environment**: Select **Production**, **Preview**, and **Development**
- **Click "Save"**

### Step 3: Redeploy

After adding all environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger automatic deployment
4. Run `npm run check-env` locally to validate the configuration before pushing new code

## 🛡️ Additional Safeguards

### Fallback Environment Variable Handling

The code has been updated to handle missing environment variables gracefully:

```typescript
// In middleware.ts and other Clerk-dependent files
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  console.warn('Clerk publishable key not found. Please configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Vercel.');
  // Fallback behavior or throw error
}
```

## 🔍 Verification Steps

1. **Check Environment Variables in Vercel**
   - Go to Settings → Environment Variables
   - Verify all required variables are present
   - Ensure they're enabled for Production environment

2. **Test Deployment**
   - Trigger a new deployment
   - Check build logs for any missing environment variables
   - Verify the application loads correctly

3. **Check Application Functionality**
   - Test authentication flows
   - Verify Supabase connections
   - Check API endpoints

## 🔄 Key Rotation & Repository Cleanup

1. Rotate the Clerk publishable and secret keys in the Clerk dashboard, then update Vercel with the new values.
2. Regenerate the Supabase anon and service role keys from the Supabase project settings and update all environments.
3. Invalidate any other exposed secrets (JWT, CoinGecko, etc.) and distribute replacements securely.
4. Purge the leaked keys from git history using `git filter-repo` or BFG Repo-Cleaner, then force-push the sanitized history.
5. Re-deploy the application and verify that the old keys are no longer accepted.
6. Notify your security/operations team about the rotation for auditing purposes.

> Until rotation is complete, assume the exposed keys are compromised.

## 📋 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- [ ] `JWT_SECRET`
- [ ] `COINGECKO_API_KEY` (optional)
- [ ] `ALLOWED_ADMIN_EMAILS=admin@zignals.org,dagz55@gmail.com` (optional)

## 🚀 After Configuration

Once all environment variables are configured in Vercel:
1. The deployment should build successfully
2. Authentication will work properly
3. Supabase integration will function correctly
4. All API endpoints will be accessible

## 📞 Support

If you continue to have issues:
1. Check Vercel deployment logs for specific error messages
2. Verify environment variable names match exactly
3. Ensure variables are enabled for the correct environments
4. Check Clerk dashboard for any API key issues