# Database Migration Guide

## Current Status
❌ **Error**: `relation "public.profiles" does not exist`

This error occurs because migrations must be applied in the correct order.

## Step-by-Step Migration Process

### Step 1: Apply Initial Schema
1. Open Supabase Dashboard SQL Editor: https://vxtalnnjudbogemgmkoe.supabase.co/project/vxtalnnjudbogemgmkoe/sql
2. Copy the **entire contents** of `supabase/migrations/20240101000000_initial_schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute
5. ✅ Verify success: Should create 6 tables (profiles, trades, signals, transactions, crypto_prices, news)

### Step 2: Apply RLS Policies (ONLY AFTER Step 1)
1. Copy the **entire contents** of `supabase/migrations/20240101000001_rls_policies.sql`
2. Paste into SQL Editor
3. Click "Run" to execute
4. ✅ Verify success: Should enable RLS and create security policies

### Step 3: Apply Auth Triggers (ONLY AFTER Steps 1 & 2)
1. Copy the **entire contents** of `supabase/migrations/20240101000002_auth_triggers.sql`
2. Paste into SQL Editor
3. Click "Run" to execute
4. ✅ Verify success: Should create user profile trigger and utility functions

## Expected Tables After Migration

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `trades` | Trading history and positions |
| `signals` | Trading signals and recommendations |
| `transactions` | Deposits and withdrawals |
| `crypto_prices` | Market price data |
| `news` | Trading news and updates |

## Verification Commands

After applying all migrations, run these tests:

```bash
# Test database connection and tables
node test-comprehensive-db.js

# Test table creation success
node test-manual-table-creation.js
```

## Troubleshooting

### If Step 1 Fails:
- Check for syntax errors in the migration file
- Ensure you have proper permissions
- Try executing one CREATE TABLE statement at a time

### If Step 2 Fails:
- Ensure Step 1 completed successfully
- Verify all tables exist before applying RLS policies

### If Step 3 Fails:
- Ensure Steps 1 & 2 completed successfully
- Check that auth schema is accessible

## Post-Migration Testing

Once all migrations are applied, the application should have:
- ✅ All required tables created
- ✅ Row Level Security enabled
- ✅ User authentication triggers active
- ✅ Proper access policies in place