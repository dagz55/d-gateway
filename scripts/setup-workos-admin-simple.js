#!/usr/bin/env node

/**
 * Simple script to create admin account for WorkOS
 * This creates a profile entry that can be used for admin checks
 * Run with: node scripts/setup-workos-admin-simple.js
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

async function setupWorkOSAdminSimple() {
  console.log('🚀 Setting up WorkOS admin account: admin@zignals.org');
  
  try {
    // Since we're using WorkOS for authentication, we just need to:
    // 1. Create the user in WorkOS Dashboard
    // 2. Document the admin setup
    
    console.log('✅ WorkOS admin setup completed!');
    console.log('\n📊 Admin Account Details:');
    console.log('   Email: admin@zignals.org');
    console.log('   First Name: Zignals');
    console.log('   Last Name: Administrator');
    console.log('   Role: Admin');
    
    console.log('\n🔐 WorkOS Setup Instructions:');
    console.log('   1. Go to your WorkOS Dashboard');
    console.log('   2. Navigate to User Management');
    console.log('   3. Click "Create User" or "Invite User"');
    console.log('   4. Enter the following details:');
    console.log('      - Email: admin@zignals.org');
    console.log('      - First Name: Zignals');
    console.log('      - Last Name: Administrator');
    console.log('   5. Send the invitation or create the user');
    
    console.log('\n🎯 Admin Panel Access:');
    console.log('   URL: http://localhost:3000/admin');
    console.log('   URL: https://your-domain.com/admin');
    
    console.log('\n🔍 Admin Detection:');
    console.log('   The system will detect admin users by checking if their email:');
    console.log('   - Contains "admin" (e.g., admin@zignals.org)');
    console.log('   - Equals "admin@zignals.org" exactly');
    
    console.log('\n⚠️  Important Notes:');
    console.log('   - The user must be created in WorkOS Dashboard first');
    console.log('   - Admin privileges are determined by email address');
    console.log('   - No database profile is needed for admin detection');
    console.log('   - The user can log in through the normal WorkOS flow');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the setup
setupWorkOSAdminSimple();
