const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspectDatabase() {
  console.log('🔍 Inspecting Supabase Database State...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  console.log('📋 Configuration:');
  console.log(`- URL: ${supabaseUrl}`);
  console.log(`- Service Role Key: ${serviceRoleKey.substring(0, 20)}...`);
  console.log('');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Check authentication status
    console.log('🔐 Checking Authentication Tables...');
    
    // List all users in auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`❌ Cannot access auth.users: ${usersError.message}`);
    } else {
      console.log(`✅ Auth Users Count: ${users.users.length}`);
      if (users.users.length > 0) {
        console.log('📝 Existing Users:');
        users.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
          console.log(`      Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log(`      Metadata: ${JSON.stringify(user.user_metadata || {})}`);
          console.log('');
        });
      }
    }
    
    // Check profiles table
    console.log('👤 Checking Profiles Table...');
    
    const possibleProfileTables = ['profiles', 'user_profiles', 'public.profiles', 'public.user_profiles'];
    let profileTableFound = null;
    let profileData = null;
    
    for (const tableName of possibleProfileTables) {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from(tableName.replace('public.', ''))
          .select('*')
          .limit(10);
          
        if (!profilesError && profiles) {
          profileTableFound = tableName;
          profileData = profiles;
          break;
        }
      } catch (err) {
        // Table doesn't exist, continue
      }
    }
    
    if (profileTableFound) {
      console.log(`✅ Profiles table found: ${profileTableFound}`);
      console.log(`📊 Profile records count: ${profileData.length}`);
      
      if (profileData.length > 0) {
        console.log('📝 Profile Records:');
        profileData.forEach((profile, index) => {
          console.log(`   ${index + 1}. ID: ${profile.id}`);
          console.log(`      User ID: ${profile.user_id || profile.id}`);
          console.log(`      Email: ${profile.email || 'N/A'}`);
          console.log(`      Name: ${profile.full_name || profile.name || 'N/A'}`);
          console.log(`      Avatar: ${profile.avatar_url || 'N/A'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ No profiles table found. Checking table structure...');
      
      // Try to list all tables
      try {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        if (tablesError) {
          console.log(`❌ Cannot list tables: ${tablesError.message}`);
        } else {
          console.log('📋 Available public tables:');
          tables.forEach(table => {
            console.log(`   - ${table.table_name}`);
          });
        }
      } catch (err) {
        console.log('❌ Cannot inspect database schema');
      }
    }
    
    // Summary
    console.log('\n📊 Database State Summary:');
    console.log('- Connection: ✅ Successful');
    console.log(`- Auth Users: ${users ? users.users.length : 0}`);
    console.log(`- Profile Table: ${profileTableFound ? '✅ Found' : '❌ Missing'}`);
    console.log(`- Profile Records: ${profileData ? profileData.length : 0}`);
    
    if (!users || users.users.length === 0) {
      console.log('\n🔧 Next Steps:');
      console.log('1. Need to create test users');
      console.log('2. Create profiles table if missing');
      console.log('3. Link users to profiles');
    }
    
  } catch (error) {
    console.log(`❌ Database inspection failed: ${error.message}`);
  }
}

inspectDatabase();