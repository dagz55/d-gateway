# Clerk Setup Guide for Zignal

## Quick Start

This guide will help you set up Clerk authentication in your Zignal application using the App Router approach.

## Step 1: Create Clerk Account

1. Visit [clerk.com](https://clerk.com) and create an account
2. Create a new application in the Clerk Dashboard
3. Choose your authentication methods (email/password, OAuth providers, etc.)

## Step 2: Get Your API Keys

From your Clerk Dashboard:
1. Navigate to **API Keys** section
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)

## Step 3: Update Environment Variables

Update your `.env.local` file with your actual Clerk keys:

```bash
# Replace these placeholder values with your actual keys from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE

# Keep these URL configurations as they are
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Enable Clerk (set to true when ready to switch from WorkOS)
NEXT_PUBLIC_USE_CLERK=false
```

## Step 4: Configure Clerk Dashboard

### Authentication Settings
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable desired authentication methods:
   - Email address (recommended)
   - Phone number (optional)
   - Username (optional)

### Social Connections (OAuth)
1. Go to **User & Authentication** → **Social Connections**
2. Enable providers:
   - Google
   - GitHub
   - Microsoft
   - Others as needed

### Session Settings
1. Go to **User & Authentication** → **Sessions**
2. Configure:
   - Session lifetime: 7 days (or as needed)
   - Inactivity timeout: 30 minutes (or as needed)

### Paths Configuration
1. Go to **Paths**
2. Verify these are set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

## Step 5: Enable Clerk in Your Application

### Option A: Gradual Migration (Recommended)

1. Keep both authentication systems running in parallel
2. Test Clerk with a subset of users
3. When ready, switch the feature flag:

```bash
# In .env.local
NEXT_PUBLIC_USE_CLERK=true
```

### Option B: Full Switch

1. Replace the middleware:
```bash
# Backup current middleware
mv middleware.ts middleware.workos.bak

# Use Clerk middleware
cp middleware.clerk.ts middleware.ts
```

2. Update the providers:
```bash
# Backup current providers
mv app/providers.tsx app/providers.workos.bak

# Use unified providers
cp app/providers-unified.tsx app/providers.tsx
```

3. Set the environment variable:
```bash
NEXT_PUBLIC_USE_CLERK=true
```

## Step 6: Test Authentication

1. Start your development server:
```bash
npm run dev
```

2. Test the following flows:
   - Sign up with email/password
   - Sign in with email/password
   - Sign in with OAuth (Google, GitHub, etc.)
   - Sign out
   - Access protected routes
   - Password reset (if enabled)

## Step 7: Migrate User Data

### Export Users from WorkOS
Run the migration script (when available):
```bash
npm run migrate:users
```

### Import Users to Clerk
Users can be imported via:
1. Clerk Dashboard → **Users** → **Import**
2. Using Clerk's Backend API
3. Using the migration script

## Step 8: Production Deployment

### Update Production Environment Variables
In your deployment platform (Vercel, etc.), add:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY
NEXT_PUBLIC_USE_CLERK=true
```

### Configure Production Domain
1. In Clerk Dashboard → **Domains**
2. Add your production domain
3. Configure allowed redirect URLs

## File Structure

The Clerk integration adds/modifies these files:

```
zignal-login/
├── middleware.clerk.ts          # Clerk middleware
├── middleware.unified.ts        # Unified middleware (both systems)
├── app/
│   ├── providers/
│   │   └── clerk-provider.tsx  # ClerkProvider wrapper
│   ├── providers-unified.tsx   # Unified providers
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx        # Clerk sign-in page
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx        # Clerk sign-up page
├── hooks/
│   └── useUnifiedAuth.ts       # Unified auth hook
└── components/
    ├── auth/
    │   └── ProtectedRoute.tsx  # Protected route wrapper
    └── layout/
        └── UnifiedHeader.tsx   # Header with auth UI
```

## API Endpoints

Clerk handles authentication internally, so you don't need custom API endpoints. The following WorkOS endpoints can be removed after migration:

- `/api/auth/workos/login`
- `/api/auth/workos/callback`
- `/api/auth/workos/logout`
- `/api/auth/workos/me`
- `/api/auth/workos/refresh`

## Common Use Cases

### Check if User is Signed In

```typescript
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.firstName}!</div>;
}
```

### Protect a Route (Server Component)

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <div>Protected content</div>;
}
```

### Protect an API Route

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Your protected API logic
  return NextResponse.json({ data: 'Protected data' });
}
```

### Custom User Metadata

```typescript
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();

  // Access metadata
  const role = user?.publicMetadata?.role;
  const subscription = user?.publicMetadata?.subscription;

  return NextResponse.json({ role, subscription });
}
```

## Troubleshooting

### Issue: "Clerk Provider not found"
**Solution**: Ensure `<ClerkProvider>` wraps your application in `app/layout.tsx`

### Issue: Authentication not working
**Solution**: Check that:
1. Environment variables are set correctly
2. `NEXT_PUBLIC_USE_CLERK=true` is set
3. Clerk middleware is active

### Issue: Redirect loops
**Solution**: Verify your redirect URLs in Clerk Dashboard match your application routes

### Issue: OAuth not working
**Solution**:
1. Check OAuth provider configuration in Clerk Dashboard
2. Ensure redirect URLs are whitelisted
3. Verify OAuth credentials are correct

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Discord Community](https://discord.com/invite/b5rXHjAg7A)
- [Clerk Support](https://clerk.com/support)

## Migration Checklist

- [ ] Created Clerk account
- [ ] Obtained API keys
- [ ] Updated environment variables
- [ ] Configured Clerk Dashboard settings
- [ ] Installed Clerk dependencies
- [ ] Created middleware with `clerkMiddleware()`
- [ ] Added `<ClerkProvider>` to layout
- [ ] Created sign-in/sign-up pages
- [ ] Tested authentication flows
- [ ] Migrated user data
- [ ] Updated production environment
- [ ] Removed WorkOS code (after full migration)

## Next Steps

1. **Test thoroughly** in development before switching production
2. **Monitor** authentication metrics after deployment
3. **Customize** the Clerk UI to match your brand
4. **Implement** additional features like MFA, organizations, etc.

Remember: The migration is designed to be gradual. You can run both systems in parallel until you're confident to fully switch to Clerk.