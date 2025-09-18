#!/usr/bin/env node

/**
 * WorkOS Database Migration Script
 * 
 * This script migrates the database schema to unify user data storage
 * and make it compatible with WorkOS authentication while maintaining
 * compatibility with existing ProfileSection and ProfileDropdown components.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUserProfilesTable() {
  console.log('🔄 Creating/updating user_profiles table schema...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID, -- For backward compatibility with old Supabase auth
      workos_user_id TEXT UNIQUE, -- WorkOS user ID
      email TEXT NOT NULL,
      username TEXT,
      full_name TEXT,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      profile_picture_url TEXT,
      is_admin BOOLEAN DEFAULT false,
      package TEXT DEFAULT 'PREMIUM',
      trader_level TEXT DEFAULT 'BEGINNER',
      status TEXT DEFAULT 'ONLINE',
      role TEXT DEFAULT 'user',
      admin_permissions TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT valid_user_id CHECK (user_id IS NOT NULL OR workos_user_id IS NOT NULL)
    );
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  if (error) {
    console.error('❌ Failed to create user_profiles table:', error);
    throw error;
  }
  
  console.log('✅ user_profiles table schema ready');
}

async function createIndexes() {
  console.log('🔄 Creating database indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_workos_user_id ON user_profiles(workos_user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);',
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);',
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);',
  ];
  
  for (const indexSQL of indexes) {
    const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
    if (error) {
      console.warn('⚠️  Index creation warning:', error.message);
    }
  }
  
  console.log('✅ Database indexes created');
}

async function migrateFromUserData() {
  console.log('🔄 Migrating data from user_data table...');
  
  try {
    // Check if user_data table exists and has data
    const { data: userData, error: fetchError } = await supabase
      .from('user_data')
      .select('*');
    
    if (fetchError) {
      console.log('ℹ️  No user_data table found, skipping migration');
      return { migrated: 0, skipped: 0 };
    }
    
    if (!userData || userData.length === 0) {
      console.log('ℹ️  No data in user_data table to migrate');
      return { migrated: 0, skipped: 0 };
    }
    
    console.log(`📊 Found ${userData.length} records to migrate from user_data`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const user of userData) {
      try {
        // Check if user already exists in user_profiles
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('workos_user_id', user.workos_user_id)
          .single();
        
        if (existing) {
          console.log(`⏭️  User ${user.email} already exists in user_profiles`);
          skipped++;
          continue;
        }
        
        // Migrate user to user_profiles table
        const profileData = {
          workos_user_id: user.workos_user_id,
          email: user.email,
          username: user.username || user.full_name?.toLowerCase().replace(/\s+/g, ''),
          full_name: user.full_name,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url,
          profile_picture_url: user.profile_picture_url,
          is_admin: user.is_admin || false,
          package: user.package || 'PREMIUM',
          trader_level: user.trader_level || 'BEGINNER',
          status: user.status || 'ONLINE',
          role: user.is_admin ? 'admin' : 'user',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData);
        
        if (insertError) {
          console.error(`❌ Failed to migrate user ${user.email}:`, insertError);
          continue;
        }
        
        console.log(`✅ Migrated user: ${user.email}`);
        migrated++;
        
      } catch (userError) {
        console.error(`❌ Error migrating user ${user.email}:`, userError);
      }
    }
    
    return { migrated, skipped };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

async function enableRLS() {
  console.log('🔄 Setting up Row Level Security...');
  
  const rlsCommands = [
    'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;',
    `
    CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
    FOR SELECT USING (
      workos_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );
    `,
    `
    CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
      workos_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );
    `,
    `
    CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM user_profiles admin_profile
        WHERE (admin_profile.workos_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
               OR admin_profile.user_id::text = current_setting('request.jwt.claims', true)::json->>'sub')
        AND admin_profile.is_admin = true
      )
    );
    `,
  ];
  
  for (const command of rlsCommands) {
    const { error } = await supabase.rpc('exec_sql', { sql: command });
    if (error) {
      console.warn('⚠️  RLS setup warning:', error.message);
    }
  }
  
  console.log('✅ Row Level Security configured');
}

async function runMigration() {
  try {
    console.log('🚀 Starting WorkOS Database Migration...\n');
    
    // Step 1: Create/update user_profiles table
    await createUserProfilesTable();
    
    // Step 2: Create indexes for performance
    await createIndexes();
    
    // Step 3: Migrate data from user_data table if it exists
    const migrationResults = await migrateFromUserData();
    
    // Step 4: Set up Row Level Security
    await enableRLS();
    
    // Summary
    console.log('\n📋 Migration Summary:');
    console.log('==========================================');
    console.log(`✅ user_profiles table: Ready`);
    console.log(`✅ Database indexes: Created`);
    console.log(`✅ Records migrated: ${migrationResults.migrated}`);
    console.log(`⏭️  Records skipped: ${migrationResults.skipped}`);
    console.log(`✅ Row Level Security: Enabled`);
    
    console.log('\n🎉 WorkOS Database Migration completed successfully!');
    console.log('\n📱 Next Steps:');
    console.log('1. Update WorkOS callback to use user_profiles table');
    console.log('2. Test authentication flow');
    console.log('3. Verify profile components work correctly');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);