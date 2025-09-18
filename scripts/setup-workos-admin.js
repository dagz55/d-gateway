#!/usr/bin/env node

/**
 * Script to set up admin user for WorkOS authentication
 * This script creates a profile entry for admin@zignals.org in the database
 * Run with: node scripts/setup-workos-admin.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Simple UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupWorkOSAdminUser() {
  console.log('🚀 Setting up WorkOS admin user: admin@zignals.org');
  
  try {
    // Step 1: Create a profile entry for the admin user
    // Since WorkOS handles authentication, we just need to create the profile
    console.log('👑 Creating admin profile in database...');
    
    const adminProfileData = {
      user_id: generateUUID(), // Generate a unique UUID for WorkOS user
      email: 'admin@zignals.org',
      username: 'admin',
      full_name: 'Zignals Administrator',
      avatar_url: null,
      age: 30,
      gender: 'PREFER_NOT_TO_SAY',
      trader_level: 'ADVANCED',
      account_balance: 0,
      is_verified: true,
      package: 'VIP',
      status: 'ONLINE',
      timezone: 'UTC',
      language: 'en',
      password: null,
      phone: null,
      country: null,
      bio: 'System Administrator',
      social_links: {},
      trading_preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Check if admin profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@zignals.org')
      .single();
    
    let profileResult;
    
    if (existingProfile) {
      // Update existing profile
      console.log('🔄 Updating existing admin profile...');
      profileResult = await supabase
        .from('user_profiles')
        .update({
          full_name: 'Zignals Administrator',
          username: 'admin',
          package: 'VIP',
          trader_level: 'ADVANCED',
          is_verified: true,
          bio: 'System Administrator',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@zignals.org');
    } else {
      // Insert new profile
      console.log('➕ Creating new admin profile...');
      profileResult = await supabase
        .from('user_profiles')
        .insert(adminProfileData);
    }
    
    if (profileResult.error) {
      console.error('❌ Error setting up admin profile:', profileResult.error.message);
      return;
    }
    
    // Step 2: Verify the setup
    console.log('🔍 Verifying admin setup...');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@zignals.org')
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching admin profile:', profileError.message);
      return;
    }
    
    if (profile) {
      console.log('✅ WorkOS admin setup completed successfully!');
      console.log('\n📊 Admin User Details:');
      console.log('   User ID:', profile.user_id);
      console.log('   Email:', profile.email);
      console.log('   Username:', profile.username);
      console.log('   Full Name:', profile.full_name);
      console.log('   Package:', profile.package);
      console.log('   Trader Level:', profile.trader_level);
      console.log('   Verified:', profile.is_verified);
      console.log('   Bio:', profile.bio);
      console.log('\n🔐 WorkOS Setup:');
      console.log('   1. Go to your WorkOS Dashboard');
      console.log('   2. Navigate to User Management');
      console.log('   3. Create a new user with email: admin@zignals.org');
      console.log('   4. Set the user details:');
      console.log('      - First Name: Zignals');
      console.log('      - Last Name: Administrator');
      console.log('      - Email: admin@zignals.org');
      console.log('\n🎯 Admin Panel Access:');
      console.log('   URL: http://localhost:3000/admin');
      console.log('   URL: https://your-domain.com/admin');
      console.log('\n⚠️  Note: The user must be created in WorkOS Dashboard first!');
    } else {
      console.error('❌ Admin setup failed - profile not created');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the setup
setupWorkOSAdminUser();
