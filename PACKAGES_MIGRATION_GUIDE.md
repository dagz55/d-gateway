# 📦 Packages Tables Migration Guide

This guide will help you create the missing packages tables in your Supabase database.

## 🎯 Overview

The packages system requires two main tables:
- **`packages`** - Stores subscription packages available on the platform
- **`user_packages`** - Tracks user subscriptions to packages

## 🚀 Quick Setup (Choose One Method)

### Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Navigate to your Zignal project

2. **Access SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Execute Migration**
   - Copy the entire contents of `supabase/migrations/20250919074400_create_packages_tables.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see `packages` and `user_packages` tables

### Method 2: Supabase CLI

```bash
# If you have Supabase CLI installed
npx supabase migration up
```

### Method 3: Manual SQL Execution

If you prefer to execute specific parts, here's the minimal SQL needed:

```sql
-- Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    features TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_packages table
CREATE TABLE IF NOT EXISTS public.user_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (anyone can view active packages)
CREATE POLICY "Anyone can view active packages" ON public.packages
    FOR SELECT USING (active = true);

CREATE POLICY "Users can view own subscriptions" ON public.user_packages
    FOR SELECT USING (auth.uid() = user_id);
```

## 🧪 Testing the Migration

After executing the migration, run this verification script:

```bash
node scripts/apply-packages-migration.js
```

You should see:
- ✅ Packages table exists and is accessible!
- Sample packages listed (if you included sample data)

## 📊 What's Created

### Tables
- **packages** - Subscription package definitions
- **user_packages** - User subscription tracking

### Features
- **Row Level Security (RLS)** - Secure access control
- **Indexes** - Optimized query performance
- **Triggers** - Automatic timestamp updates
- **Sample Data** - 3 example packages for testing

### Admin Features
- Admins can create/edit/delete packages
- Users can view active packages and their own subscriptions
- Full audit trail with created/updated timestamps

## 🔧 Troubleshooting

### ❌ "Table 'packages' doesn't exist"
- Ensure you executed the full migration SQL
- Check for any SQL errors in the Supabase logs

### ❌ "Permission denied"
- Make sure you're using the service role key for admin operations
- Check RLS policies are properly configured

### ❌ "Foreign key constraint fails"
- Ensure the `auth.users` table exists
- Check if user IDs in your system match auth.users

## 🎯 Next Steps

Once the migration is complete:

1. **Test Package Creation**
   - Go to `/admin/packages/create`
   - Try creating a test package
   - Verify it appears in `/admin/packages`

2. **Configure Package Features**
   - Customize the sample packages
   - Set appropriate pricing and features
   - Enable/disable packages as needed

3. **Set Up Payment Integration**
   - Configure payment processing
   - Set up subscription webhooks
   - Test the complete purchase flow

## 📚 Schema Reference

### Packages Table
```sql
id            UUID PRIMARY KEY
name          TEXT NOT NULL
description   TEXT NOT NULL
price         DECIMAL(10,2) NOT NULL
duration_days INTEGER NOT NULL
features      TEXT[] DEFAULT '{}'
active        BOOLEAN DEFAULT true
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### User Packages Table
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users(id)
package_id  UUID REFERENCES packages(id)
status      TEXT CHECK (status IN ('active','inactive','cancelled','expired'))
start_date  TIMESTAMPTZ DEFAULT NOW()
end_date    TIMESTAMPTZ NOT NULL
auto_renew  BOOLEAN DEFAULT true
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

---

**✨ Ready to go!** Your packages system will be fully functional once this migration is applied.