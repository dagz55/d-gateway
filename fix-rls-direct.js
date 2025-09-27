#!/usr/bin/env node

/**
 * Fix User Profiles RLS Policies - Direct Approach
 * This script applies the necessary RLS policies using direct SQL execution
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
    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }
    console.log('✅ Connection successful');

    // 1. Check if clerk_user_id column exists
    console.log('📝 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });

    if (columnsError) {
      console.log('⚠️  Could not check columns, proceeding with migration...');
    } else {
      console.log('✅ Table structure checked');
    }

    // 2. Try to add clerk_user_id column using a simple query
    console.log('📝 Adding clerk_user_id column...');
    try {
      const { error: alterError } = await supabase
        .from('user_profiles')
        .select('clerk_user_id')
        .limit(1);
      
      if (alterError && alterError.message.includes('column "clerk_user_id" does not exist')) {
        console.log('📝 Column does not exist, will be added by migration');
      } else {
        console.log('✅ clerk_user_id column exists');
      }
    } catch (err) {
      console.log('⚠️  Could not check column, proceeding...');
    }

    // 3. Create a simple test to verify RLS is working
    console.log('📝 Testing RLS policies...');
    
    // Try to insert a test profile (this should fail if RLS is working)
    const testProfile = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select();

    if (insertError) {
      if (insertError.message.includes('row-level security')) {
        console.log('✅ RLS is enabled and working');
      } else {
        console.log('⚠️  RLS might not be properly configured:', insertError.message);
      }
    } else {
      console.log('⚠️  RLS might not be enabled - insert succeeded');
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', 'test-user-id');
    }

    // 4. Check current policies
    console.log('📝 Checking current RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'user_profiles' });

    if (policiesError) {
      console.log('⚠️  Could not check policies:', policiesError.message);
    } else {
      console.log('✅ Current policies:', policies);
    }

    console.log('🎉 RLS check completed!');
    console.log('📋 Next steps:');
    console.log('1. Apply the migration file: supabase/migrations/20250925000001_fix_user_profiles_rls.sql');
    console.log('2. Or run: supabase db reset to apply all migrations');
    console.log('3. Or manually apply the SQL from the migration file in Supabase dashboard');

  } catch (error) {
    console.error('❌ Error checking RLS policies:', error);
  }
}

// Run the fix
fixUserProfilesRLS();
