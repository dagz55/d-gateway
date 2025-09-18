#!/usr/bin/env node

/**
 * Script to test the database integration for WorkOS users
 * Run with: node scripts/test-database-integration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseIntegration() {
  console.log('🧪 Testing database integration for WorkOS users...');
  
  try {
    // Test 1: Check if user_profiles table exists and is accessible
    console.log('\n1️⃣ Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Table access error:', testError);
      return;
    }
    console.log('✅ user_profiles table is accessible');

    // Test 2: Insert a test user
    console.log('\n2️⃣ Testing user insertion...');
    const crypto = require('crypto');
    const testUser = {
      user_id: crypto.randomUUID(),
      email: 'test@zignals.org',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      package: 'PREMIUM',
      trader_level: 'BEGINNER',
      status: 'ONLINE',
      is_verified: true
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testUser)
      .select()
      .single();

    if (insertError) {
      console.error('❌ User insertion error:', insertError);
      return;
    }
    console.log('✅ Test user inserted successfully:', insertedUser.id);

    // Test 3: Test admin user insertion
    console.log('\n3️⃣ Testing admin user insertion...');
    const adminUser = {
      user_id: crypto.randomUUID(),
      email: 'admin@zignals.org',
      username: 'admin',
      full_name: 'Zignals Administrator',
      avatar_url: null,
      package: 'VIP',
      trader_level: 'ADVANCED',
      status: 'ONLINE',
      is_verified: true
    };

    const { data: insertedAdmin, error: adminInsertError } = await supabase
      .from('user_profiles')
      .insert(adminUser)
      .select()
      .single();

    if (adminInsertError) {
      console.error('❌ Admin user insertion error:', adminInsertError);
    } else {
      console.log('✅ Admin user inserted successfully:', insertedAdmin.id);
    }

    // Test 4: Test user lookup by user_id
    console.log('\n4️⃣ Testing user lookup...');
    const { data: foundUser, error: lookupError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUser.user_id)
      .single();

    if (lookupError) {
      console.error('❌ User lookup error:', lookupError);
    } else {
      console.log('✅ User lookup successful:', foundUser.email);
    }

    // Test 5: Test admin detection (by email pattern)
    console.log('\n5️⃣ Testing admin detection...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .or('email.ilike.%admin%,email.eq.admin@zignals.org,email.eq.dagz55@gmail.com');

    if (adminError) {
      console.error('❌ Admin lookup error:', adminError);
    } else {
      console.log('✅ Admin users found:', adminUsers.length);
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.full_name} (${admin.email})`);
      });
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('user_profiles').delete().eq('user_id', testUser.user_id);
    if (insertedAdmin) {
      await supabase.from('user_profiles').delete().eq('user_id', adminUser.user_id);
    }
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Database integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the authentication flow in the browser');
    console.log('   2. Check that user data is saved to the database');
    console.log('   3. Verify admin detection works correctly');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testDatabaseIntegration();
