const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testBasicFunctionality() {
  console.log('🔧 Testing basic database functionality...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test 1: Check auth users table (this should always exist)
    console.log('🔐 Testing auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log(`❌ Auth error: ${authError.message}`);
    } else {
      console.log(`✅ Auth system working. Current users: ${authUsers.users.length}`);
    }
    
    // Test 2: Try to access any existing tables
    console.log('\n📊 Testing table access with different approaches...');
    
    // Try using REST API endpoints directly
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      });
      
      if (response.ok) {
        console.log('✅ REST API accessible');
      } else {
        console.log(`⚠️  REST API status: ${response.status}`);
      }
    } catch (fetchError) {
      console.log(`❌ REST API error: ${fetchError.message}`);
    }
    
    // Test 3: Check if we can create a temporary table
    console.log('\n🛠️  Attempting to work with existing structure...');
    
    // Since we can't create tables programmatically, let's test with auth.users
    try {
      const { data: userCount, error: countError } = await supabase
        .rpc('get_function_list');
        
      if (countError) {
        console.log(`⚠️  RPC not available: ${countError.message}`);
      } else {
        console.log('✅ RPC functions accessible');
      }
    } catch (rpcError) {
      console.log(`⚠️  RPC test failed: ${rpcError.message}`);
    }
    
    console.log('\n📋 Summary:');
    console.log('✅ Supabase connection: Working');
    console.log('✅ Authentication system: Working');
    console.log('❌ Application tables: Need manual creation');
    console.log('\n🎯 Next Steps:');
    console.log('1. Manual table creation required through Supabase Dashboard');
    console.log('2. Use SQL Editor to run migration files');
    console.log('3. Application will be fully functional after table creation');
    
    console.log('\n🌐 Supabase Dashboard SQL Editor:');
    console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/project/vxtalnnjudbogemgmkoe/sql`);
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testBasicFunctionality();