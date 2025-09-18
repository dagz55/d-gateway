#!/usr/bin/env node

/**
 * Setup script to create test users for ProfileSection and ProfileDropdown testing
 * This script creates both regular and admin test accounts in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'member@zignal.dev',
    password: 'ZignalMember2024!',
    role: 'user',
    fullName: 'Test Member',
    isAdmin: false,
    userMetadata: {
      full_name: 'Test Member',
      role: 'member'
    }
  },
  {
    email: 'admin@zignal.dev',
    password: 'ZignalAdmin2024!',
    role: 'admin',
    fullName: 'Test Admin',
    isAdmin: true,
    userMetadata: {
      full_name: 'Test Admin',
      role: 'admin'
    }
  }
];

async function createTestUser(userData) {
  try {
    console.log(`\n🔄 Creating user: ${userData.email}`);
    
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: userData.userMetadata,
      email_confirm: true // Auto-confirm email for testing
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  User ${userData.email} already exists in auth table`);
        
        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.find(u => u.email === userData.email);
        if (!existingUser) {
          throw new Error(`Could not find existing user ${userData.email}`);
        }
        
        authUser.user = existingUser;
      } else {
        throw authError;
      }
    } else {
      console.log(`✅ Created auth user: ${userData.email}`);
    }

    // Create or update profile in user_profiles table
    const profileData = {
      user_id: authUser.user.id,
      email: userData.email,
      username: userData.fullName.toLowerCase().replace(/\s+/g, ''),
      full_name: userData.fullName,
      avatar_url: null,
      is_admin: userData.isAdmin,
      role: userData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_admin: userData.isAdmin,
          role: userData.role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authUser.user.id);

      if (updateError) throw updateError;
      console.log(`✅ Updated profile for: ${userData.email}`);
    } else {
      // Create new profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) throw profileError;
      console.log(`✅ Created profile for: ${userData.email}`);
    }

    return {
      success: true,
      user: authUser.user,
      profile: profileData
    };

  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function setupTestUsers() {
  console.log('🚀 Setting up test users for ProfileSection and ProfileDropdown testing...\n');
  
  const results = [];
  
  for (const userData of testUsers) {
    const result = await createTestUser(userData);
    results.push({ ...userData, ...result });
  }
  
  console.log('\n📋 Setup Summary:');
  console.log('==========================================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const role = result.isAdmin ? 'Admin' : 'Member';
    console.log(`${status} ${result.email} (${role})`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n📱 Test the components:');
  console.log('==========================================');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to http://localhost:3000');
  console.log('3. Login with either test account:');
  console.log('   • Member: member@zignal.dev / ZignalMember2024!');
  console.log('   • Admin:  admin@zignal.dev / ZignalAdmin2024!');
  console.log('4. Verify ProfileSection (sidebar) and ProfileDropdown (header) functionality');
  console.log('5. Test logout functionality with both accounts');
  
  const successCount = results.filter(r => r.success).length;
  if (successCount === results.length) {
    console.log('\n🎉 All test users created successfully!');
  } else {
    console.log(`\n⚠️  ${successCount}/${results.length} users created successfully`);
  }
}

// Run the setup
setupTestUsers().catch(console.error);