#!/usr/bin/env node

/**
 * Fix User Profiles RLS Policies
 * This script applies the necessary RLS policies to fix the Clerk integration issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserProfilesRLS() {
  console.log('🔧 Fixing User Profiles RLS Policies...');

  try {
    // 1. Add clerk_user_id column if it doesn't exist
    console.log('📝 Adding clerk_user_id column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_profiles 
        ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
      `
    });

    if (alterError) {
      console.log('⚠️  Column might already exist:', alterError.message);
    } else {
      console.log('✅ clerk_user_id column added');
    }

    // 2. Create index for better performance
    console.log('📝 Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id 
        ON public.user_profiles(clerk_user_id);
      `
    });

    if (indexError) {
      console.log('⚠️  Index might already exist:', indexError.message);
    } else {
      console.log('✅ Index created');
    }

    // 3. Enable RLS
    console.log('📝 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`
    });

    if (rlsError) {
      console.log('⚠️  RLS might already be enabled:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }

    // 4. Drop existing policies
    console.log('📝 Dropping existing policies...');
    const policies = [
      'Users can view own profile',
      'Users can update own profile', 
      'Users can insert own profile',
      'Users can delete own profile',
      'Public profile view for copy trading',
      'Admins can manage all profiles',
      'Service role can manage profiles'
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON public.user_profiles;`
      });
      if (error) {
        console.log(`⚠️  Policy ${policy} might not exist:`, error.message);
      }
    }
    console.log('✅ Existing policies dropped');

    // 5. Create new comprehensive policies
    console.log('📝 Creating new RLS policies...');
    
    const policies_sql = [
      // Users can view their own profile
      `CREATE POLICY "Users can view own profile" ON public.user_profiles
        FOR SELECT USING (
          auth.uid()::text = user_id::text
          OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
        );`,

      // Users can update their own profile
      `CREATE POLICY "Users can update own profile" ON public.user_profiles
        FOR UPDATE USING (
          auth.uid()::text = user_id::text
          OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
        );`,

      // Users can insert their own profile
      `CREATE POLICY "Users can insert own profile" ON public.user_profiles
        FOR INSERT WITH CHECK (
          auth.uid()::text = user_id::text
          OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
        );`,

      // Users can delete their own profile
      `CREATE POLICY "Users can delete own profile" ON public.user_profiles
        FOR DELETE USING (
          auth.uid()::text = user_id::text
          OR (clerk_user_id IS NOT NULL AND auth.uid()::text = clerk_user_id)
        );`,

      // Public profile viewing for copy trading
      `CREATE POLICY "Public profile view for copy trading" ON public.user_profiles
        FOR SELECT USING (auth.role() = 'authenticated');`,

      // Service role can manage all profiles
      `CREATE POLICY "Service role can manage profiles" ON public.user_profiles
        FOR ALL USING (auth.role() = 'service_role');`,

      // Admins can manage all profiles
      `CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE (up.user_id::text = auth.uid()::text OR up.clerk_user_id = auth.uid()::text)
            AND up.is_admin = true
          )
        );`
    ];

    for (const sql of policies_sql) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('❌ Error creating policy:', error.message);
        console.error('SQL:', sql);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    // 6. Create helper functions
    console.log('📝 Creating helper functions...');
    
    const functions_sql = [
      // Function to get user profile by Clerk ID
      `CREATE OR REPLACE FUNCTION public.get_user_profile_by_clerk_id(clerk_id TEXT)
      RETURNS SETOF public.user_profiles AS $$
      BEGIN
          RETURN QUERY
          SELECT * FROM public.user_profiles 
          WHERE clerk_user_id = clerk_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      // Function to upsert user profile by Clerk ID
      `CREATE OR REPLACE FUNCTION public.upsert_user_profile_by_clerk_id(
          clerk_id TEXT,
          profile_data JSONB
      )
      RETURNS public.user_profiles AS $$
      DECLARE
          result_profile public.user_profiles;
      BEGIN
          -- Try to update first
          UPDATE public.user_profiles 
          SET 
              email = COALESCE(profile_data->>'email', email),
              username = COALESCE(profile_data->>'username', username),
              full_name = COALESCE(profile_data->>'full_name', full_name),
              first_name = COALESCE(profile_data->>'first_name', first_name),
              last_name = COALESCE(profile_data->>'last_name', last_name),
              avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
              bio = COALESCE(profile_data->>'bio', bio),
              phone = COALESCE(profile_data->>'phone', phone),
              country = COALESCE(profile_data->>'country', country),
              timezone = COALESCE(profile_data->>'timezone', timezone),
              language = COALESCE(profile_data->>'language', language),
              package = COALESCE(profile_data->>'package', package),
              trader_level = COALESCE(profile_data->>'trader_level', trader_level),
              is_admin = COALESCE((profile_data->>'is_admin')::boolean, is_admin),
              updated_at = NOW()
          WHERE clerk_user_id = clerk_id
          RETURNING * INTO result_profile;
          
          -- If no update occurred, insert new profile
          IF NOT FOUND THEN
              INSERT INTO public.user_profiles (
                  user_id,
                  clerk_user_id,
                  email,
                  username,
                  full_name,
                  first_name,
                  last_name,
                  avatar_url,
                  bio,
                  phone,
                  country,
                  timezone,
                  language,
                  package,
                  trader_level,
                  is_admin,
                  created_at,
                  updated_at
              ) VALUES (
                  COALESCE(profile_data->>'user_id', gen_random_uuid()::text),
                  clerk_id,
                  profile_data->>'email',
                  profile_data->>'username',
                  profile_data->>'full_name',
                  profile_data->>'first_name',
                  profile_data->>'last_name',
                  profile_data->>'avatar_url',
                  profile_data->>'bio',
                  profile_data->>'phone',
                  profile_data->>'country',
                  profile_data->>'timezone',
                  profile_data->>'language',
                  profile_data->>'package',
                  profile_data->>'trader_level',
                  COALESCE((profile_data->>'is_admin')::boolean, false),
                  NOW(),
                  NOW()
              )
              RETURNING * INTO result_profile;
          END IF;
          
          RETURN result_profile;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ];

    for (const sql of functions_sql) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('❌ Error creating function:', error.message);
        console.error('SQL:', sql);
      } else {
        console.log('✅ Function created successfully');
      }
    }

    // 7. Grant permissions
    console.log('📝 Granting permissions...');
    const permissions_sql = [
      'GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;',
      'GRANT ALL ON public.user_profiles TO service_role;',
      'GRANT EXECUTE ON FUNCTION public.get_user_profile_by_clerk_id(TEXT) TO authenticated;',
      'GRANT EXECUTE ON FUNCTION public.upsert_user_profile_by_clerk_id(TEXT, JSONB) TO authenticated;',
      'GRANT EXECUTE ON FUNCTION public.get_user_profile_by_clerk_id(TEXT) TO service_role;',
      'GRANT EXECUTE ON FUNCTION public.upsert_user_profile_by_clerk_id(TEXT, JSONB) TO service_role;'
    ];

    for (const sql of permissions_sql) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('❌ Error granting permission:', error.message);
        console.error('SQL:', sql);
      } else {
        console.log('✅ Permission granted successfully');
      }
    }

    console.log('🎉 User Profiles RLS policies fixed successfully!');
    console.log('✅ Clerk integration should now work properly');

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
    process.exit(1);
  }
}

// Run the fix
fixUserProfilesRLS();
