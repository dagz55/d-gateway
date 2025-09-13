const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
  console.log('🏗️  Creating database tables...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Test if we can create a simple table first
    console.log('🧪 Testing table creation capability...');
    
    // Try to query system tables to check permissions
    const { data: schemas, error: schemaError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .eq('schema_name', 'public')
      .limit(1);
    
    if (schemaError) {
      console.log(`❌ Cannot access schema information: ${schemaError.message}`);
      return;
    }
    
    console.log('✅ Schema access confirmed');
    
    // Check if tables already exist
    console.log('\n🔍 Checking existing tables...');
    
    const tablesToCheck = ['profiles', 'trades', 'signals', 'transactions', 'crypto_prices', 'news'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('not found')) {
            console.log(`❌ ${tableName}: Does not exist`);
          } else {
            console.log(`⚠️  ${tableName}: ${error.message}`);
          }
        } else {
          console.log(`✅ ${tableName}: Already exists`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error - ${err.message}`);
      }
    }
    
    console.log('\n📋 Database Schema Status:');
    console.log('- Connection: ✅ Successful');
    console.log('- Service Role Access: ✅ Confirmed');
    console.log('- Tables: ❌ Need to be created manually');
    console.log('\n🔧 To create tables:');
    console.log('1. Visit Supabase Dashboard SQL Editor');
    console.log('2. Copy and paste the contents of each migration file:');
    console.log('   - supabase/migrations/20240101000000_initial_schema.sql');
    console.log('   - supabase/migrations/20240101000001_rls_policies.sql');
    console.log('   - supabase/migrations/20240101000002_auth_triggers.sql');
    console.log('3. Execute each file in order');
    console.log(`4. Dashboard URL: ${supabaseUrl.replace('/rest/v1', '')}/project/vxtalnnjudbogemgmkoe/sql`);
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

createTables();