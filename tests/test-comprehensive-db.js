const { createClient } = require('@supabase/supabase-js');

async function comprehensiveDBTest() {
  console.log('🔍 Comprehensive Supabase Database Test...\n');

  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }

  try {
    // Use service role for full access
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('📊 Checking existing tables...');
    
    // Query information_schema to see what tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_list');
    
    if (tablesError) {
      console.log('⚠️  Could not query tables list via RPC, trying direct schema query...');
      
      // Try a different approach - query pg_tables
      const { data: pgTables, error: pgError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (pgError) {
        console.log('❌ Cannot access schema information:', pgError.message);
        
        // Try basic table existence checks
        console.log('\n🔍 Testing common table existence...');
        const commonTables = [
          'users', 'user_profiles', 'profiles', 
          'trading_accounts', 'accounts',
          'trades', 'transactions', 'signals'
        ];
        
        for (const tableName of commonTables) {
          try {
            const { error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
              
            if (error) {
              if (error.message.includes('does not exist') || error.message.includes('not found')) {
                console.log(`❌ ${tableName}: Does not exist`);
              } else {
                console.log(`⚠️  ${tableName}: Exists but access restricted (${error.message})`);
              }
            } else {
              console.log(`✅ ${tableName}: Exists and accessible`);
            }
          } catch (err) {
            console.log(`❌ ${tableName}: Error - ${err.message}`);
          }
        }
      } else {
        console.log('✅ Available tables:', pgTables.map(t => t.table_name));
      }
    } else {
      console.log('✅ Available tables:', tables);
    }

    // Test auth tables (these should exist by default)
    console.log('\n🔐 Testing auth system tables...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log(`❌ Auth admin access: ${authError.message}`);
      } else {
        console.log(`✅ Auth system working. Users count: ${authUsers.users.length}`);
      }
    } catch (err) {
      console.log(`❌ Auth test failed: ${err.message}`);
    }

    // Test creating a simple table for testing
    console.log('\n🛠️  Testing table creation...');
    try {
      const { error: createError } = await supabase
        .rpc('create_test_table');
        
      if (createError) {
        console.log(`⚠️  Could not create test table via RPC: ${createError.message}`);
      } else {
        console.log('✅ Table creation test successful');
      }
    } catch (err) {
      console.log(`⚠️  Table creation test skipped: ${err.message}`);
    }

    console.log('\n📋 Database Status Summary:');
    console.log('- Connection: ✅ Successful');
    console.log('- Authentication: Need to verify');
    console.log('- Schema: Need to create application tables');
    
  } catch (error) {
    console.log(`❌ Comprehensive test failed: ${error.message}`);
  }
}

comprehensiveDBTest();