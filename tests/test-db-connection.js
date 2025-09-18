const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment Variables:');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required Supabase environment variables');
    return;
  }

  try {
    // Test client connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      
      // Test if it's an auth issue
      if (error.message.includes('JWT')) {
        console.log('🔐 Testing with service role key...');
        
        if (serviceRoleKey) {
          const adminClient = createClient(supabaseUrl, serviceRoleKey);
          const { data: adminData, error: adminError } = await adminClient
            .from('user_profiles')
            .select('count')
            .limit(1);
            
          if (adminError) {
            console.log(`❌ Admin connection failed: ${adminError.message}`);
          } else {
            console.log('✅ Admin connection successful');
            console.log('ℹ️  RLS policies may be blocking anonymous access');
          }
        }
      }
      return;
    }

    console.log('✅ Basic connection successful');

    // Test table access
    console.log('\n📋 Testing table access...');
    
    const tables = ['user_profiles', 'trading_accounts'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.log(`❌ ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Test auth functionality
    console.log('\n🔐 Testing authentication...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.log(`❌ Auth error: ${authError.message}`);
      } else {
        console.log('✅ Auth service available');
        console.log(`Current session: ${authData.session ? 'Active' : 'None'}`);
      }
    } catch (err) {
      console.log(`❌ Auth test failed: ${err.message}`);
    }

    console.log('\n🏁 Connection test completed');

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testSupabaseConnection();