# Manual RLS Policy Application

Due to migration conflicts with the Supabase CLI, you can apply the RLS policies manually through the Supabase Dashboard.

## Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Navigate to **SQL Editor**

2. **Copy and Execute the RLS Policies**
   - Open the file: `supabase/migrations/20250919190000_fix_missing_rls_policies.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run**

## Method 2: Database Connection (Advanced)

If you have direct database access:

```bash
# Use your database connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/migrations/20250919190000_fix_missing_rls_policies.sql
```

## Method 3: Bypass Migration System

If the migrations are causing conflicts, you can apply just the RLS policies:

1. Open SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `apply-rls-only.sql`
3. Execute the SQL

## What This Fixes

These RLS policies will resolve the following security issues:

- ✅ `copy_trading` - RLS enabled with proper policies
- ✅ `crypto_prices` - RLS enabled with proper policies
- ✅ `news_articles` - RLS enabled with proper policies
- ✅ `notifications` - RLS enabled with proper policies
- ✅ `performance_analytics` - RLS enabled with proper policies
- ✅ `portfolio_holdings` - RLS enabled with proper policies
- ✅ `profiles` - RLS enabled with proper policies
- ✅ `trades` - RLS enabled with proper policies
- ✅ `trading_accounts` - RLS enabled with proper policies
- ✅ `trading_signals` - RLS enabled with proper policies
- ✅ `transactions` - RLS enabled with proper policies
- ✅ `user_data` - RLS enabled with proper policies
- ✅ `watchlist` - RLS enabled with proper policies

## Verification

After applying the policies, run the test script to verify:

```bash
node test-rls-policies.js
```

This will confirm all tables now have proper RLS protection.

## Policy Summary

The policies implement:

1. **User Data Protection**: Users can only access their own data
2. **Admin Access**: Admins can manage all data
3. **Public Data**: Crypto prices and published news are readable by all authenticated users
4. **Copy Trading**: Followers can view limited trader data when actively following
5. **Service Role**: System operations can manage data for maintenance

All policies use proper authentication checks with support for both Supabase Auth UIDs and Clerk user IDs.