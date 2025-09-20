#!/usr/bin/env node

/**
 * Apply Clerk User ID Migration Script
 * 
 * This script adds the clerk_user_id column to the user_profiles table
 * and sets up the necessary functions and policies for photo uploads.
 */

const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🚀 Starting Clerk User ID Migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250920000001_add_clerk_user_id_to_user_profiles.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration SQL loaded successfully');
    console.log('📝 Migration contents:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    
    console.log('\n✅ Migration file is ready to be applied to your Supabase database.');
    console.log('\n🔧 To apply this migration:');
    console.log('1. Copy the SQL content above');
    console.log('2. Go to your Supabase Dashboard → SQL Editor');
    console.log('3. Paste and execute the SQL');
    console.log('4. Verify the changes in the Table Editor');
    console.log('5. Run the test: node simple-migration-test.js');
    
    console.log('\n📋 This migration will:');
    console.log('• Add clerk_user_id column to user_profiles table');
    console.log('• Create index for better performance');
    console.log('• Update RLS policies for Clerk integration');
    console.log('• Add helper functions for photo upload management');
    console.log('• Update the handle_new_user trigger function');
    
    console.log('\n🎯 After migration, you can:');
    console.log('• Link Clerk users to Supabase profiles');
    console.log('• Manage photo uploads per user profile');
    console.log('• Use clerk_user_id for authentication flows');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
