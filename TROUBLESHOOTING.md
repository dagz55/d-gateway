# Troubleshooting Guide

## Current Errors and Solutions

### 1. "JWT secret must be at least 32 characters long"

**Problem**: Missing or too short JWT_SECRET environment variable.

**Solution**:
```bash
# Generate secure secrets with correct lengths
npm run generate-secrets

# Add to your .env.local file:
JWT_SECRET=your_generated_64_character_hex_string_here
```

### 1.5. "NEXTAUTH_SECRET is required"

**Problem**: NextAuth secret is missing or invalid.

**Solution**:
```bash
# Generate secrets with correct lengths
npm run generate-secrets

# Add to your .env.local file:
NEXTAUTH_SECRET=your_generated_base64_secret
```

### 2. "Invalid Clerk credentials" (Clerk Error)

**Problem**: Clerk credentials are missing or incorrect.

**Solution**:
```bash
# Check your environment variables
npm run check-env

# Get credentials from Clerk Dashboard:
# https://dashboard.clerk.com/

# Add to .env.local:
CLERK_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

### 3. "No authorization code provided"

**Problem**: WorkOS callback is being called without proper OAuth parameters.

**Solution**: This usually happens when:
- WorkOS credentials are wrong (see #2 above)
- Redirect URI mismatch in WorkOS dashboard
- User cancels the OAuth flow

**Fix**: Ensure your WorkOS dashboard has the correct redirect URI:
- Development: `http://localhost:3000/api/auth/workos/callback`
- Production: `https://zignals.org/api/auth/workos/callback`

### 4. Rate Limiting (429 errors)

**Problem**: Too many requests in a short time.

**Solution**: This is expected behavior. Wait a moment between authentication attempts.

## Quick Fix Commands

```bash
# 1. Check what's missing
npm run check-env

# 2. Generate required secrets
npm run generate-secrets

# 3. Copy template and edit with your credentials
cp env-template.txt .env.local
# Edit .env.local with your actual WorkOS credentials

# 4. Restart development server
npm run dev
```

## Environment Variables Checklist

Required variables for Clerk authentication:
- ✅ CLERK_SECRET_KEY (from Clerk dashboard)
- ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from Clerk dashboard)
- ✅ NEXTAUTH_SECRET (base64 encoded secret)
- ✅ JWT_SECRET (32+ characters)
- ✅ NEXT_PUBLIC_SITE_URL (http://localhost:3000 for dev)

## Clerk Dashboard Configuration

1. Go to https://dashboard.clerk.com/
2. Navigate to your application
3. Set allowed origins:
   - `http://localhost:3000` (development)
   - `https://zignals.org` (production)
4. Copy your API Key and Client ID to .env.local

## Still Having Issues?

1. **Clear browser cache** and cookies
2. **Restart development server** after changing environment variables
3. **Check browser console** for additional error details
4. **Verify WorkOS dashboard** configuration matches your environment variables
