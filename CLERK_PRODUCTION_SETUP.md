# Clerk Production Setup Guide

## Overview
This guide helps you configure Clerk for production deployment to eliminate the development keys warning.

## Current Warning
```
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
```

## Solution: Switch to Production Keys

### 1. Create Production Application in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Add Application" or "Create Application"
3. Choose "Production" environment (not "Development")
4. Configure your production settings:
   - **Application name**: `Zignals Production`
   - **Domain**: Your production domain (e.g., `zignals.org`)
   - **Sign-in URL**: `https://yourdomain.com/sign-in`
   - **Sign-up URL**: `https://yourdomain.com/sign-up`

### 2. Get Production Keys

From your production application in Clerk Dashboard:

1. Go to **API Keys** section
2. Copy the **Publishable Key** (starts with `pk_live_`)
3. Copy the **Secret Key** (starts with `sk_live_`)

### 3. Update Environment Variables

Update your production environment variables:

```bash
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here
CLERK_SECRET_KEY=sk_live_your_production_secret_key_here

# Production Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 4. Configure Production Settings

In your Clerk production application:

#### Authentication Settings
- **Sign-in URL**: `https://yourdomain.com/sign-in`
- **Sign-up URL**: `https://yourdomain.com/sign-up`
- **After sign-in URL**: `https://yourdomain.com/dashboard`
- **After sign-up URL**: `https://yourdomain.com/dashboard`

#### Organization Settings (if needed)
- **Allow organization creation**: `false` (already configured in code)
- **Allow organization invitations**: `false` (already configured in code)

#### Security Settings
- **Password requirements**: Configure as needed
- **MFA**: Enable if required
- **Session management**: Configure timeout and refresh settings

### 5. Deploy with Production Keys

1. Update your production environment variables
2. Deploy your application
3. Verify the warning is gone in production

## Verification

After deploying with production keys, you should see:
- ✅ No development keys warning
- ✅ No 403 organization creation errors
- ✅ Proper redirect URLs working
- ✅ All authentication flows working correctly

## Troubleshooting

### Still seeing development keys warning?
- Check that you're using `pk_live_` and `sk_live_` keys
- Verify environment variables are properly set in production
- Clear browser cache and restart your application

### Organization creation errors?
- The code already disables organization features
- If you need organizations, enable them in Clerk Dashboard first
- Update the `allowOrganizationCreation` prop in `app/providers.tsx`

### Redirect issues?
- Verify all URLs in Clerk Dashboard match your production domain
- Check that `NEXT_PUBLIC_SITE_URL` is set correctly
- Ensure HTTPS is used for all production URLs

## Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| Keys | `pk_test_`, `sk_test_` | `pk_live_`, `sk_live_` |
| Domain | `localhost:3000` | `yourdomain.com` |
| HTTPS | Optional | Required |
| Organizations | Disabled | Configurable |
| Usage Limits | Strict | Standard |

## Next Steps

1. ✅ Create production Clerk application
2. ✅ Get production keys
3. ✅ Update environment variables
4. ✅ Deploy application
5. ✅ Verify no warnings appear
6. ✅ Test all authentication flows
