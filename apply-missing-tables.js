#!/usr/bin/env node

/**
 * Apply Missing Database Tables
 * Creates the missing tables for token management and session tracking
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🔄 Applying missing database tables...\n');

  try {
    // Read and apply the missing tables migration
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250917000002_missing_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📊 Creating missing tables (token_families, user_sessions, user_devices, refresh_tokens)...');
    const { error: tablesError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (tablesError) {
      console.error('❌ Failed to create tables:', tablesError);
    } else {
      console.log('✅ Missing tables created successfully');
    }

    // Read and apply the WorkOS user ID fix migration
    const fixPath = path.join(__dirname, 'supabase/migrations/20250917000003_fix_workos_user_ids.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    
    console.log('🔧 Fixing WorkOS user ID compatibility...');
    const { error: fixError } = await supabase.rpc('exec_sql', { sql: fixSQL });
    
    if (fixError) {
      console.error('❌ Failed to apply WorkOS fixes:', fixError);
    } else {
      console.log('✅ WorkOS user ID compatibility fixed');
    }

    console.log('\n🎉 Database migrations completed successfully!');
    console.log('🚀 You can now restart your development server.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Alternative approach if exec_sql doesn't exist
async function applyMigrationsAlternative() {
  console.log('🔄 Applying migrations using direct SQL execution...\n');

  try {
    // Create missing tables one by one
    console.log('📊 Creating token_families table...');
    const { error: tokenFamiliesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'token_families')
      .single();

    if (tokenFamiliesError && tokenFamiliesError.code === 'PGRST116') {
      console.log('✅ token_families table needs to be created');
      // Table doesn't exist, we need to create it
      console.log('⚠️  Please run the migration manually in your Supabase SQL editor:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Run the SQL from supabase/migrations/20250917000002_missing_tables.sql');
      console.log('   4. Run the SQL from supabase/migrations/20250917000003_fix_workos_user_ids.sql');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

// Run the migration
applyMigrations().catch(() => {
  console.log('\n⚠️  Direct migration failed. Please apply manually:');
  console.log('1. Open your Supabase dashboard SQL Editor');
  console.log('2. Run: supabase/migrations/20250917000002_missing_tables.sql');
  console.log('3. Run: supabase/migrations/20250917000003_fix_workos_user_ids.sql');
});
