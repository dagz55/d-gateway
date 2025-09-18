# WorkOS + Supabase Integration Guide

This guide implements WorkOS AuthKit as a Supabase third-party auth provider, allowing you to use WorkOS for authentication while maintaining Supabase's database capabilities with RLS policies.

## Architecture Overview

- **Authentication**: WorkOS AuthKit handles user authentication
- **Database**: Supabase provides database with RLS policies
- **Integration**: WorkOS access tokens are used to authenticate with Supabase APIs
- **Benefits**: Enterprise auth + Supabase database features

## Implementation Steps

### 1. Configure WorkOS as Supabase Third-Party Auth Provider

In your Supabase dashboard, go to Authentication → Third-party providers and add WorkOS:

**Issuer URL:**
```
https://api.workos.com/user_management/client_YOUR_CLIENT_ID
```

Replace `YOUR_CLIENT_ID` with your actual WorkOS Client ID.

### 2. Set up JWT Template in WorkOS Dashboard

In your WorkOS dashboard, go to Authentication → Sessions and create a JWT template:

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

### 3. Environment Variables

Add these to your `.env.local`:

```bash
# WorkOS Configuration
WORKOS_API_KEY=sk_your_api_key_here
WORKOS_CLIENT_ID=client_your_client_id_here
WORKOS_COOKIE_PASSWORD=your_32_character_password_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WorkOS + Supabase Integration
WORKOS_ISSUER_URL=https://api.workos.com/user_management/client_YOUR_CLIENT_ID
```

### 4. Updated Supabase Client

The Supabase client is now configured to accept WorkOS access tokens:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

// Set the WorkOS access token
await supabase.auth.setSession({
  access_token: workosAccessToken,
  refresh_token: ''
})
```

## Benefits

1. **Enterprise Authentication**: WorkOS provides enterprise-grade auth
2. **Supabase Database**: Keep all Supabase database features
3. **RLS Policies**: Row Level Security works with WorkOS tokens
4. **Real-time**: Supabase real-time subscriptions work normally
5. **Unified Experience**: Single authentication flow with both services

## Testing

Run the test script to validate the integration:

```bash
npm run test:workos
```

## Troubleshooting

- Ensure JWT template includes required claims (`sub`, `email`, `role`)
- Verify WorkOS issuer URL matches your client ID
- Check that Supabase third-party provider is configured correctly
- Validate that access tokens are being passed correctly
