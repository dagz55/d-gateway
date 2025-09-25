#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * This script helps set up admin users for the Zignal platform.
 * It can be run locally or in production to ensure admin access is properly configured.
 */

const { createClerkClient } = require('@clerk/backend');
require('dotenv').config({ path: '.env.local' });

const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function setupAdminUser(email) {
  try {
    console.log(`Setting up admin user for: ${email}`);
    
    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });
    
    if (users.data.length === 0) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('Please make sure the user has signed up first.');
      return;
    }
    
    const user = users.data[0];
    console.log(`✅ Found user: ${user.emailAddresses[0]?.emailAddress} (ID: ${user.id})`);
    
    // Update user with admin metadata
    const updatedUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        isAdmin: true,
        role: 'admin',
        adminPermissions: ['users', 'signals', 'finances', 'payments', 'system'],
        setupDate: new Date().toISOString()
      }
    });
    
    console.log('✅ Admin user setup complete!');
    console.log('Updated metadata:', updatedUser.publicMetadata);
    
    // Verify the setup
    const verification = await clerkClient.users.getUser(user.id);
    console.log('✅ Verification - User is now admin:', verification.publicMetadata?.isAdmin);
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    if (error.errors) {
      console.error('Detailed errors:', error.errors);
    }
  }
}

async function listUsers() {
  try {
    console.log('📋 Listing all users...');
    const users = await clerkClient.users.getUserList({
      limit: 10
    });
    
    console.log(`Found ${users.data.length} users:`);
    users.data.forEach((user, index) => {
      const isAdmin = user.publicMetadata?.isAdmin || user.publicMetadata?.role === 'admin';
      console.log(`${index + 1}. ${user.emailAddresses[0]?.emailAddress} - ${isAdmin ? '✅ Admin' : '❌ Not Admin'}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  const email = process.argv[3];
  
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY not found in environment variables');
    process.exit(1);
  }
  
  switch (command) {
    case 'setup':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: node scripts/setup-admin-user.js setup user@example.com');
        process.exit(1);
      }
      await setupAdminUser(email);
      break;
      
    case 'list':
      await listUsers();
      break;
      
    default:
      console.log('Zignal Admin User Setup Script');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/setup-admin-user.js setup <email>  - Set up admin user');
      console.log('  node scripts/setup-admin-user.js list           - List all users');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/setup-admin-user.js setup admin@zignals.org');
      console.log('  node scripts/setup-admin-user.js list');
      break;
  }
}

main().catch(console.error);
