#!/usr/bin/env node

/**
 * Simple script to manually set admin role for admin@zignals.org
 * Run with: node scripts/setup-admin-simple.js
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

async function setupAdminUserSimple() {
  console.log('🚀 Setting up admin user: admin@zignals.org');
  
  try {
    // Step 1: Check if user exists in auth.users
    console.log('🔍 Checking if user exists in auth...');
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }
    
    let adminUser = users.find(user => user.email === 'admin@zignals.org');
    
    if (!adminUser) {
      console.log('👤 Creating admin user in auth...');
      
      // Create the admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@zignals.org',
        password: 'AdminZignals2024!', // You should change this password
        email_confirm: true,
        user_metadata: {
          full_name: 'Zignals Administrator',
          display_name: 'Admin'
        }
      });
      
      if (createError) {
        console.error('❌ Error creating admin user:', createError.message);
        return;
      }
      
      adminUser = newUser.user;
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists in auth');
    }
    
    // Step 2: Manually insert/update admin profile
    console.log('👑 Setting up admin permissions...');
    
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    const adminProfileData = {
      user_id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.user_metadata?.full_name || 'Zignals Administrator',
      display_name: adminUser.user_metadata?.display_name || 'Admin',
      role: 'admin',
      is_admin: true,
      admin_permissions: ['users', 'signals', 'finances', 'payments', 'system'],
      updated_at: new Date().toISOString()
    };
    
    let profileResult;
    
    if (existingProfile) {
      // Update existing profile
      console.log('🔄 Updating existing profile...');
      profileResult = await supabase
        .from('user_profiles')
        .update({
          role: 'admin',
          is_admin: true,
          admin_permissions: ['users', 'signals', 'finances', 'payments', 'system'],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', adminUser.id);
    } else {
      // Insert new profile
      console.log('➕ Creating new profile...');
      profileResult = await supabase
        .from('user_profiles')
        .insert(adminProfileData);
    }
    
    if (profileResult.error) {
      console.error('❌ Error setting up admin profile:', profileResult.error.message);
      return;
    }
    
    // Step 3: Verify the setup
    console.log('🔍 Verifying admin setup...');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching admin profile:', profileError.message);
      return;
    }
    
    if (profile && profile.is_admin) {
      console.log('✅ Admin setup completed successfully!');
      console.log('\n📊 Admin User Details:');
      console.log('   User ID:', profile.user_id);
      console.log('   Email:', profile.email);
      console.log('   Full Name:', profile.full_name);
      console.log('   Display Name:', profile.display_name);
      console.log('   Role:', profile.role);
      console.log('   Admin Status:', profile.is_admin);
      console.log('   Permissions:', profile.admin_permissions);
      console.log('\n🔐 Login Credentials:');
      console.log('   Email: admin@zignals.org');
      console.log('   Password: AdminZignals2024!');
      console.log('   ⚠️  IMPORTANT: Change this password after first login!');
      console.log('\n🎯 Admin Panel Access:');
      console.log('   URL: http://localhost:3000/admin');
      console.log('   URL: https://your-domain.com/admin');
    } else {
      console.error('❌ Admin setup failed - profile not created or not admin');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the setup
setupAdminUserSimple();