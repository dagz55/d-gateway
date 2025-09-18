# Production Deployment Guide - Zignal v2.9.0

## 🎯 Overview

This guide covers the complete setup for deploying Zignal to production with WorkOS authentication and Vercel hosting.

## 📋 Pre-Deployment Checklist

### 1. WorkOS Production Configuration

#### A. Create Production WorkOS Organization
1. Go to [WorkOS Dashboard](https://dashboard.workos.com/)
2. Create a new organization for production (or use existing)
3. Note down your production credentials:
   - `WORKOS_API_KEY` (starts with `sk_live_`)
   - `WORKOS_CLIENT_ID` (starts with `client_`)

#### B. Configure Production Domain
1. In WorkOS Dashboard → **Configuration** → **Redirect URIs**
2. Add your production domain:
   ```
   https://your-domain.vercel.app/api/auth/workos/callback
   https://your-custom-domain.com/api/auth/workos/callback  # if using custom domain
   ```

#### C. Set Up AuthKit for Production
1. Go to **AuthKit** section in WorkOS Dashboard
2. Configure your production domain
3. Update branding and styling as needed
4. Note your production AuthKit URL

### 2. Supabase Production Setup

#### A. Production Database
- Ensure your Supabase project is configured for production
- Run all necessary migrations
- Set up proper RLS policies
- Create the `public_image` storage bucket

#### B. Storage Configuration
Run this in your Supabase SQL Editor:
```sql
-- Create storage bucket for production
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_image',
  'public_image',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
```

## 🚀 Vercel Deployment Steps

### Step 1: Login to Vercel
```bash
vercel login
```

### Step 2: Link Project (if not already linked)
```bash
vercel link
```

### Step 3: Set Production Environment Variables
```bash
# Set WorkOS Production Variables
vercel env add WORKOS_API_KEY production
vercel env add WORKOS_CLIENT_ID production
vercel env add WORKOS_COOKIE_PASSWORD production
vercel env add JWT_SECRET production

# Set Site URL
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add WORKOS_REDIRECT_URI production
vercel env add WORKOS_LOGOUT_REDIRECT_URI production

# Set Supabase Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Set Admin Configuration
vercel env add ALLOWED_ADMIN_EMAILS production

# Set Security Configuration
vercel env add SECURITY_LOGGING_ENABLED production
vercel env add SECURITY_LOG_LEVEL production
```

### Step 4: Deploy to Production
```bash
vercel --prod
```

## 🔧 Production Environment Variables

### Required Variables
```bash
# WorkOS Production
WORKOS_API_KEY=sk_live_your_production_api_key
WORKOS_CLIENT_ID=client_your_production_client_id
WORKOS_COOKIE_PASSWORD=your_32_character_password
JWT_SECRET=your_32_plus_character_jwt_secret

# Site URLs (replace with your actual domain)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
WORKOS_REDIRECT_URI=https://your-domain.vercel.app/api/auth/workos/callback
WORKOS_LOGOUT_REDIRECT_URI=https://your-domain.vercel.app/

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ALLOWED_ADMIN_EMAILS=dagz55@gmail.com,admin@signals.org,admin@zignals.org

# Security
SECURITY_LOGGING_ENABLED=true
SECURITY_LOG_LEVEL=info
```

### Optional Variables
```bash
# WorkOS Advanced Configuration
WORKOS_EMAIL_DOMAIN=your-domain.com
WORKOS_AUTHKIT_DOMAIN=your-authkit-domain.authkit.app
WORKOS_AUTHKIT_URL=https://your-authkit-domain.authkit.app

# Performance
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
```

## 🔐 Security Considerations

### 1. Environment Variable Security
- Never commit `.env.local` to git
- Use Vercel's secure environment variable storage
- Rotate secrets regularly
- Use different secrets for production vs development

### 2. Domain Configuration
- Always use HTTPS in production
- Configure CORS properly
- Set up proper CSP headers if needed

### 3. Database Security
- Enable RLS on all tables
- Use service role key only for server-side operations
- Regularly audit database access logs

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
Enable Vercel Analytics in your dashboard for performance monitoring.

### 2. Error Tracking
Consider adding error tracking service like Sentry for production monitoring.

### 3. Security Monitoring
The app includes built-in security event logging that works in production.

## 🧪 Testing Production Deployment

### 1. Authentication Flow
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out functionality
- [ ] Admin access (for admin users)

### 2. Core Features
- [ ] Dashboard loads correctly
- [ ] Trading signals display
- [ ] Profile settings work
- [ ] Photo upload/remove functions
- [ ] Wallet functionality

### 3. Performance
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] API responses are fast
- [ ] Mobile responsiveness

## 🚨 Troubleshooting

### Common Issues

#### 1. WorkOS Callback Error
**Problem**: Authentication fails with callback error
**Solution**: 
- Check redirect URI matches exactly in WorkOS dashboard
- Ensure HTTPS is used in production URLs
- Verify environment variables are set correctly

#### 2. Supabase Connection Issues
**Problem**: Database or storage operations fail
**Solution**:
- Verify Supabase URL and keys are for production project
- Check RLS policies allow authenticated operations
- Ensure storage bucket exists and is public

#### 3. Photo Upload Issues
**Problem**: Photo uploads fail in production
**Solution**:
- Verify storage bucket is created and configured
- Check API route is deployed correctly
- Ensure file size limits are configured properly

## 🎉 Post-Deployment

### 1. Custom Domain (Optional)
If using a custom domain:
1. Add domain in Vercel dashboard
2. Update DNS records
3. Update WorkOS redirect URIs
4. Update environment variables

### 2. Performance Optimization
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Optimize images if needed
- Set up caching strategies

### 3. Backup & Recovery
- Regular database backups
- Environment variable documentation
- Deployment rollback plan

---

**Ready for Production**: ✅ v2.9.0 with complete photo upload system
**Last Updated**: January 27, 2025
**Status**: Production Ready
