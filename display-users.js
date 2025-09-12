const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 Displaying Registered Users from Supabase...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function displayUsers() {
  try {
    console.log('📊 Fetching users from Supabase Auth...\n');
    
    // Get all users from Supabase Auth
    const { data: response, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }
    
    const users = response?.users || [];
    
    if (users.length === 0) {
      console.log('📭 No users found in the database');
      return;
    }
    
    console.log(`✅ Found ${users.length} registered user(s)\n`);
    
    // Display users in a formatted table
    console.log('┌─────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                                REGISTERED USERS                                │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
    
    users.forEach((user, index) => {
      const userData = user.user_metadata || {};
      const email = user.email || 'No email';
      const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown';
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never';
      const isConfirmed = user.email_confirmed_at ? '✅' : '❌';
      const isActive = user.banned_until ? '❌ Banned' : '✅ Active';
      
      console.log(`│ User #${index + 1}`);
      console.log(`│ Email: ${email}`);
      console.log(`│ ID: ${user.id}`);
      console.log(`│ Name: ${userData.full_name || userData.name || 'Not set'}`);
      console.log(`│ Confirmed: ${isConfirmed}`);
      console.log(`│ Status: ${isActive}`);
      console.log(`│ Created: ${createdAt}`);
      console.log(`│ Last Sign In: ${lastSignIn}`);
      console.log(`│ Provider: ${user.app_metadata?.provider || 'email'}`);
      
      if (userData.avatar_url) {
        console.log(`│ Avatar: ${userData.avatar_url}`);
      }
      
      if (index < users.length - 1) {
        console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
      }
    });
    
    console.log('└─────────────────────────────────────────────────────────────────────────────────┘');
    
    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Confirmed Users: ${users.filter(u => u.email_confirmed_at).length}`);
    console.log(`   Unconfirmed Users: ${users.filter(u => !u.email_confirmed_at).length}`);
    console.log(`   Active Users: ${users.filter(u => !u.banned_until).length}`);
    console.log(`   Banned Users: ${users.filter(u => u.banned_until).length}`);
    
    // Recent sign-ins (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo);
    console.log(`   Recent Sign-ins (7 days): ${recentUsers.length}`);
    
    // Provider breakdown
    const providerCounts = {};
    users.forEach(user => {
      const provider = user.app_metadata?.provider || 'email';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });
    
    console.log('\n🔐 Authentication Providers:');
    Object.entries(providerCounts).forEach(([provider, count]) => {
      console.log(`   ${provider}: ${count} user(s)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

displayUsers();
