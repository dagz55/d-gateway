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
  secretKey: process.env.CLERK_SECRET_KEY,
});

const ADMIN_PERMISSIONS = process.env.ADMIN_PERMISSIONS
  ? process.env.ADMIN_PERMISSIONS.split(',')
  : ['users', 'signals', 'finances', 'payments', 'system', 'reports'];

// A simple validation to ensure no unknown permissions are added
const VALID_PERMISSIONS = new Set(['users', 'signals', 'finances', 'payments', 'system', 'reports', 'audits']);
ADMIN_PERMISSIONS.forEach(permission => {
  if (!VALID_PERMISSIONS.has(permission)) {
    console.warn(`⚠️ Unknown permission configured: "${permission}". Please check your ADMIN_PERMISSIONS environment variable.`);
  }
});


async function setupAdminUser(email) {
  try {
    console.log(`Setting up admin user for: ${email}`);

    const users = await clerkClient.users.getUserList({ emailAddress: [email] });

    if (users.data.length === 0) {
      console.error(`❌ User not found: ${email}. Please ensure they have an account.`);
      return;
    }

    const user = users.data[0];
    console.log(`✅ Found user: ${user.emailAddresses[0]?.emailAddress} (ID: ${user.id})`);

    const updatedUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        isAdmin: true,
        role: 'admin',
        adminPermissions: ADMIN_PERMISSIONS, // Use the configurable permissions
        setupDate: new Date().toISOString(),
      },
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
    console.log('📋 Listing users...');
    
    // Make limit configurable, with a sensible default and validation
    const limit = parseInt(process.env.USER_LIST_LIMIT || '10', 10);
    if (isNaN(limit) || limit <= 0) {
      console.error('❌ Invalid USER_LIST_LIMIT. Please provide a positive integer.');
      return;
    }

    const users = await clerkClient.users.getUserList({ limit });
    
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
