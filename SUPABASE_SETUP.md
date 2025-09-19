# Supabase Migration Setup Guide

## Overview
This guide documents the migration from mock authentication to Supabase Auth with full database integration for Zignal - Advanced Trading Signals Platform.

## Supabase Project Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose your organization
5. Set project name: `zignal-trading-platform`
6. Set database password (keep this secure)
7. Choose region closest to your users
8. Click "Create new project"

### 2. Get API Keys
Once your project is created:
1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)
   - **service_role key** (starts with `eyJ`) - Keep this secret!

### 3. Update Environment Variables
Update your `.env.local` file with your actual Supabase credentials:

```bash
# Replace these with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Database Setup

### 1. Run Migrations
In your Supabase dashboard:
1. Go to SQL Editor
2. Run each migration file in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql`
   - `supabase/migrations/20240101000002_auth_triggers.sql`

### 2. Verify Tables
Check that these tables were created:
- `profiles` - User profile information
- `trades` - Trading records
- `signals` - Trading signals
- `transactions` - Deposits and withdrawals
- `crypto_prices` - Cryptocurrency price data
- `news` - News articles

### 3. Configure Auth Settings
In Supabase Dashboard > Authentication > Settings:
1. **Site URL**: Set to your app URL (e.g., `http://localhost:3000` for development)
2. **Redirect URLs**: Add your app URL and any additional redirect URLs
3. **Email Templates**: Customize sign-up and password reset emails if desired
4. **Auth Providers**: Email/password is enabled by default

## Features Implemented

### Authentication
- ✅ User registration with email verification
- ✅ Email/password login
- ✅ Password reset via email
- ✅ Session management
- ✅ Protected routes with middleware

### Database Integration
- ✅ User profiles with RLS policies
- ✅ Trading data structure (trades, signals, transactions)
- ✅ Dashboard statistics calculation
- ✅ Row Level Security for data protection
- ✅ Automatic profile creation on signup

### API Routes
- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/logout` - User logout
- ✅ `/api/auth/request-reset` - Password reset
- ✅ `/api/dashboard/stats` - Dashboard statistics

### Context & Hooks
- ✅ `AuthProvider` - Global auth state management
- ✅ `useAuth` - Authentication hook
- ✅ `useUser` - User data hook
- ✅ `useSupabase` - Supabase client hook

## Migration Status

### Completed ✅
1. Installed Supabase packages
2. Configured environment variables
3. Created Supabase client configuration
4. Created database schema and tables
5. Set up Row Level Security policies
6. Created auth context and hooks
7. Replaced other authentication providers with Clerk
8. Migrated authentication API routes
9. Updated dashboard stats to use Supabase

### Next Steps
1. **Install Dependencies**: Run `npm install` to install new Supabase packages
2. **Setup Supabase Project**: Follow the setup guide above
3. **Test Authentication**: Test signup, login, logout flows
4. **Migrate Remaining Routes**: Update other API routes to use Supabase
5. **Update UI Components**: Update forms to use new auth hooks

## Testing Checklist

### Authentication Flow
- [ ] User can sign up with email/password
- [ ] Email confirmation is sent and works
- [ ] User can log in after confirmation
- [ ] Protected routes redirect to login when not authenticated
- [ ] Authenticated users are redirected from auth pages
- [ ] User can request password reset
- [ ] Password reset email works
- [ ] User can log out successfully

### Dashboard
- [ ] Dashboard shows user-specific data
- [ ] Statistics are calculated correctly
- [ ] Real-time updates work (if implemented)

## Troubleshooting

### Common Issues
1. **"Invalid JWT"**: Check that environment variables are set correctly
2. **"Row Level Security"**: Ensure RLS policies are set up properly
3. **"User not found"**: Make sure the auth trigger creates profiles correctly
4. **"CORS errors"**: Verify Site URL is configured in Supabase settings

### Debug Steps
1. Check Supabase logs in dashboard
2. Verify environment variables are loaded
3. Test API routes directly
4. Check browser network tab for auth requests

## Security Considerations

### Row Level Security
- All tables have RLS enabled
- Users can only access their own data
- Service role bypasses RLS for admin operations

### API Security
- Server-side auth verification
- Input validation with Zod schemas
- Error handling without sensitive info leakage

### Environment Variables
- Service role key is server-side only
- Public keys are safe for client-side use
- All keys should be regenerated for production

## Performance Optimizations

### Database
- Indexed columns for common queries
- Efficient RLS policies
- Database functions for complex calculations

### Client
- Query caching with React Query
- Optimistic updates where appropriate
- Connection pooling via Supabase

This migration provides a solid foundation for scaling the Big4Trading platform with proper authentication, security, and data management.