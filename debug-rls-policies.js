#!/usr/bin/env node

/**
 * Debug RLS Policies
 * This script checks the current RLS policies and helps identify the issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugRLSPolicies() {
  console.log('🔍 Debugging RLS Policies...');

  try {
    // 1. Check if RLS is enabled
    console.log('\n📝 Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'user_profiles' });

    if (rlsError) {
      console.log('⚠️  Could not check RLS status:', rlsError.message);
    } else {
      console.log('✅ RLS Status:', rlsStatus);
    }

    // 2. Check current policies
    console.log('\n📝 Checking current policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'user_profiles' });

    if (policiesError) {
      console.log('⚠️  Could not check policies:', policiesError.message);
    } else {
      console.log('✅ Current Policies:', policies);
    }

    // 3. Test with service role (should work)
    console.log('\n📝 Testing with service role...');
    const { data: serviceData, error: serviceError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (serviceError) {
      console.log('❌ Service role test failed:', serviceError.message);
    } else {
      console.log('✅ Service role test passed');
    }

    // 4. Check table structure
    console.log('\n📝 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });

    if (columnsError) {
      console.log('⚠️  Could not check columns:', columnsError.message);
    } else {
      console.log('✅ Table columns:', columns);
    }

    // 5. Test a simple insert with service role
    console.log('\n📝 Testing insert with service role...');
    const testProfile = {
      user_id: 'test-debug-' + Date.now(),
      email: 'test-debug@example.com',
      username: 'testdebug',
      full_name: 'Test Debug User',
      clerk_user_id: 'clerk_test_' + Date.now()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test passed:', insertData);
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', testProfile.user_id);
      console.log('🧹 Test data cleaned up');
    }

    // 6. Check if the issue is with Clerk integration specifically
    console.log('\n📝 Checking Clerk integration functions...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_user_profile_by_clerk_id', { clerk_id: 'test_clerk_id' });

    if (functionsError) {
      console.log('⚠️  Clerk function test failed:', functionsError.message);
    } else {
      console.log('✅ Clerk function test passed');
    }

    console.log('\n🎯 Debug Summary:');
    console.log('1. Check if RLS is properly enabled');
    console.log('2. Verify policies are correctly applied');
    console.log('3. Test if the issue is specific to Clerk integration');
    console.log('4. Check if the error occurs in production vs development');

  } catch (error) {
    console.error('❌ Error debugging RLS policies:', error);
  }
}

// Run the debug
debugRLSPolicies();
