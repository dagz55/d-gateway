# WorkOS Migration System Audit - Zignal Authentication

## Current State Analysis

### ✅ Already Implemented (WorkOS)
1. **Dependencies**: WorkOS packages already installed
   - `@workos-inc/authkit-nextjs: ^2.7.0`
   - `@workos-inc/node: ^7.14.0`

2. **Environment Variables**: Already configured
   - `WORKOS_CLIENT_ID`: ✅ Set
   - `WORKOS_API_KEY`: ✅ Set  
   - `WORKOS_COOKIE_PASSWORD`: ✅ Set
   - All redirect URIs configured

3. **API Routes**: Full WorkOS auth flow implemented
   - `/api/auth/workos/login` ✅
   - `/api/auth/workos/callback` ✅
   - `/api/auth/workos/logout` ✅
   - `/api/auth/workos/me` ✅

4. **Utilities**: WorkOS auth infrastructure
   - `lib/workos.ts` ✅
   - `lib/auth-middleware.ts` ✅
   - `lib/supabase/workosClient.ts` ✅

5. **Components**: Frontend auth implemented
   - `WorkOSAuthCard` ✅ (main login component)
   - Main landing page uses WorkOS ✅

6. **Layout Protection**: Dashboard uses WorkOS
   - `app/(dashboard)/layout.tsx` uses `getCurrentUser()` from WorkOS ✅

7. **Middleware**: Route protection working
   - `middleware.ts` checks WorkOS session cookie ✅

### ❌ Still Using Supabase Auth (To Migrate)

1. **Profile Components**: 
   - `ProfileSection.tsx` - Uses Supabase client
   - `ProfileDropdown.tsx` - Uses Supabase client

2. **Server Actions**: 
   - `lib/actions.ts` - Uses Supabase auth methods

3. **Database Integration Issues**:
   - Callback uses `user_data` table
   - Profile components expect `user_profiles` table
   - **Inconsistent user ID mapping**

## Critical Issues to Fix

### 1. Database Schema Mismatch
- **Problem**: WorkOS callback creates users in `user_data` table
- **Profile Components**: Expect `user_profiles` table  
- **User ID Field**: Callback uses `workos_user_id`, components expect `user_id`

### 2. Authentication Context Missing
- **Problem**: No React context for WorkOS user state
- **Impact**: Client components can't access user data

### 3. Mixed Authentication Patterns
- **Server Side**: Uses WorkOS middleware
- **Client Side**: Still uses Supabase patterns

## Migration Plan

### Phase 1: Fix Database Layer
1. Standardize on single user table (`user_profiles`)
2. Update callback to use consistent schema
3. Create migration script for existing users
4. Fix WorkOS user ID mapping

### Phase 2: Create WorkOS Context
1. Build `WorkOSAuthContext` for client-side state
2. Replace Supabase auth hooks
3. Implement user session management

### Phase 3: Migrate Components
1. Update `ProfileSection` to use WorkOS context
2. Update `ProfileDropdown` to use WorkOS context  
3. Fix all authentication imports

### Phase 4: Update Server Actions
1. Replace Supabase auth in `lib/actions.ts`
2. Use WorkOS user sessions
3. Update logout flow

### Phase 5: Clean Up
1. Remove unused Supabase auth dependencies
2. Clean up old auth utilities
3. Update TypeScript types

### Phase 6: Testing & Validation
1. Test all authentication flows
2. Verify database operations
3. Check Next.js 15 compatibility

## Database Schema Requirements

```sql
-- Target schema for user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workos_user_id TEXT UNIQUE NOT NULL,  -- WorkOS user ID
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  profile_picture_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  package TEXT DEFAULT 'PREMIUM',
  trader_level TEXT DEFAULT 'BEGINNER', 
  status TEXT DEFAULT 'ONLINE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps Priority

1. **HIGH**: Fix database schema inconsistency
2. **HIGH**: Create WorkOS auth context
3. **MEDIUM**: Migrate profile components
4. **MEDIUM**: Update server actions
5. **LOW**: Clean up unused code

## Compatibility Notes

- Next.js 15: Cookie operations need async/await (already fixed in middleware)
- WorkOS AuthKit: Latest version compatible
- Supabase: Keep as database layer only, remove auth features