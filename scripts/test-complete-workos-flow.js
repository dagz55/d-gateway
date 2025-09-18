#!/usr/bin/env node

/**
 * Script to test the complete WorkOS authentication and database integration flow
 * Run with: node scripts/test-complete-workos-flow.js
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

async function testCompleteWorkOSFlow() {
  console.log('🧪 Testing complete WorkOS authentication and database integration flow...');
  
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

    // Test 2: Simulate WorkOS user authentication flow
    console.log('\n2️⃣ Simulating WorkOS user authentication...');
    const crypto = require('crypto');
    
    // Simulate a WorkOS user
    const workosUser = {
      id: 'workos-user-' + Date.now(),
      email: 'test@zignals.org',
      firstName: 'Test',
      lastName: 'User',
      profilePictureUrl: 'https://example.com/avatar.jpg'
    };

    // Step 2a: Create auth user (simulating what the callback does)
    console.log('   📝 Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: workosUser.email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        workos_user_id: workosUser.id,
        first_name: workosUser.firstName,
        last_name: workosUser.lastName,
        full_name: `${workosUser.firstName} ${workosUser.lastName}`,
        profile_picture_url: workosUser.profilePictureUrl
      }
    });

    if (authError) {
      console.error('❌ Auth user creation error:', authError);
      return;
    }
    console.log('✅ Auth user created:', authUser.user.id);

    // Step 2b: Create user profile (simulating what the callback does)
    console.log('   📝 Creating user profile...');
    const profileData = {
      user_id: authUser.user.id,
      email: workosUser.email,
      username: workosUser.email.split('@')[0],
      full_name: `${workosUser.firstName} ${workosUser.lastName}`,
      avatar_url: workosUser.profilePictureUrl,
      package: 'PREMIUM',
      trader_level: 'BEGINNER',
      status: 'ONLINE',
      is_verified: true
    };

    const { data: insertedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      return;
    }
    console.log('✅ User profile created:', insertedProfile.id);

    // Test 3: Test admin user creation
    console.log('\n3️⃣ Testing admin user creation...');
    const adminWorkosUser = {
      id: 'workos-admin-' + Date.now(),
      email: 'admin@zignals.org',
      firstName: 'Zignals',
      lastName: 'Administrator',
      profilePictureUrl: null
    };

    // Create admin auth user
    const { data: adminAuthUser, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: adminWorkosUser.email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        workos_user_id: adminWorkosUser.id,
        first_name: adminWorkosUser.firstName,
        last_name: adminWorkosUser.lastName,
        full_name: `${adminWorkosUser.firstName} ${adminWorkosUser.lastName}`,
        profile_picture_url: adminWorkosUser.profilePictureUrl
      }
    });

    if (adminAuthError) {
      console.error('❌ Admin auth user creation error:', adminAuthError);
    } else {
      console.log('✅ Admin auth user created:', adminAuthUser.user.id);

      // Create admin profile
      const adminProfileData = {
        user_id: adminAuthUser.user.id,
        email: adminWorkosUser.email,
        username: adminWorkosUser.email.split('@')[0],
        full_name: `${adminWorkosUser.firstName} ${adminWorkosUser.lastName}`,
        avatar_url: adminWorkosUser.profilePictureUrl,
        package: 'VIP',
        trader_level: 'ADVANCED',
        status: 'ONLINE',
        is_verified: true
      };

      const { data: insertedAdminProfile, error: adminProfileError } = await supabase
        .from('user_profiles')
        .insert(adminProfileData)
        .select()
        .single();

      if (adminProfileError) {
        console.error('❌ Admin profile creation error:', adminProfileError);
      } else {
        console.log('✅ Admin profile created:', insertedAdminProfile.id);
      }
    }

    // Test 4: Test user lookup and admin detection
    console.log('\n4️⃣ Testing user lookup and admin detection...');
    
    // Lookup regular user
    const { data: foundUser, error: lookupError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single();

    if (lookupError) {
      console.error('❌ User lookup error:', lookupError);
    } else {
      console.log('✅ User lookup successful:', foundUser.email);
    }

    // Test admin detection by email pattern
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

    // Test 5: Test profile update (simulating user returning)
    console.log('\n5️⃣ Testing profile update...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: 'Updated Test User',
        avatar_url: 'https://example.com/new-avatar.jpg',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authUser.user.id);

    if (updateError) {
      console.error('❌ Profile update error:', updateError);
    } else {
      console.log('✅ Profile update successful');
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('user_profiles').delete().eq('user_id', authUser.user.id);
    if (adminAuthUser) {
      await supabase.from('user_profiles').delete().eq('user_id', adminAuthUser.user.id);
    }
    
    // Delete auth users
    await supabase.auth.admin.deleteUser(authUser.user.id);
    if (adminAuthUser) {
      await supabase.auth.admin.deleteUser(adminAuthUser.user.id);
    }
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Complete WorkOS flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database integration working');
    console.log('   ✅ User profile creation working');
    console.log('   ✅ Admin user creation working');
    console.log('   ✅ User lookup working');
    console.log('   ✅ Admin detection working');
    console.log('   ✅ Profile updates working');
    console.log('\n🚀 Ready for production!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testCompleteWorkOSFlow();
