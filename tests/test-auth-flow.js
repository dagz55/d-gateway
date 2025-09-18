const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  console.log('📋 Configuration:');
  console.log(`- URL: ${supabaseUrl}`);
  console.log(`- Anon Key: ${anonKey.substring(0, 20)}...`);
  console.log('');
  
  // Create client with anon key (like the frontend would)
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    // Test 1: Check if we can get current session
    console.log('🧪 Test 1: Check current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error getting session:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found');
      console.log(`   User: ${session.user.email}`);
      console.log(`   Avatar: ${session.user.user_metadata?.avatar_url || 'None'}`);
    } else {
      console.log('❌ No active session');
    }
    
    // Test 2: Try to get user data
    console.log('\n🧪 Test 2: Get user data...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message);
    } else if (user) {
      console.log('✅ User data retrieved');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Full Name: ${user.user_metadata?.full_name || 'None'}`);
      console.log(`   Avatar URL: ${user.user_metadata?.avatar_url || 'None'}`);
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ No user data (not authenticated)');
    }
    
    // Test 3: Try to sign in with an existing user
    console.log('\n🧪 Test 3: Testing sign-in flow...');
    
    // Let's try with a user we know exists (kevssen@gmail.com has Google auth)
    // For testing, let's create a simple test user with email/password
    const testEmail = 'test@example.com';
    const testPassword = 'TestPass123!';
    
    console.log(`Attempting to sign up test user: ${testEmail}`);
    
    // First, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          avatar_url: 'https://ui-avatars.com/api/?name=Test+User&size=128&background=6366f1&color=ffffff'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Test user already exists, trying to sign in...');
        
        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
        } else {
          console.log('✅ Successfully signed in');
          console.log(`   User ID: ${signInData.user?.id}`);
          console.log(`   Email: ${signInData.user?.email}`);
          console.log(`   Avatar: ${signInData.user?.user_metadata?.avatar_url || 'None'}`);
        }
      } else {
        console.log('❌ Sign up failed:', signUpError.message);
      }
    } else {
      console.log('✅ Successfully signed up');
      console.log(`   User ID: ${signUpData.user?.id}`);
      console.log(`   Email: ${signUpData.user?.email}`);
      console.log(`   Confirmation required: ${!signUpData.session}`);
    }
    
    // Test 4: Check session after sign in/up
    console.log('\n🧪 Test 4: Check session after auth...');
    const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
    
    if (newSessionError) {
      console.log('❌ Error getting new session:', newSessionError.message);
    } else if (newSession) {
      console.log('✅ Active session after auth');
      console.log(`   User: ${newSession.user.email}`);
      console.log(`   Avatar: ${newSession.user.user_metadata?.avatar_url || 'None'}`);
      console.log(`   Access Token: ${newSession.access_token.substring(0, 20)}...`);
    } else {
      console.log('❌ No session after auth (email confirmation may be required)');
    }
    
    // Test 5: Test profile data query (if we have a session)
    if (newSession) {
      console.log('\n🧪 Test 5: Query profiles table...');
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();
          
        if (profileError) {
          console.log('❌ Profile query failed:', profileError.message);
        } else if (profile) {
          console.log('✅ Profile found in database');
          console.log(`   Profile data:`, profile);
        } else {
          console.log('❌ No profile found for user');
        }
      } catch (err) {
        console.log('❌ Profile query error:', err.message);
      }
    }
    
    // Summary
    console.log('\n📊 Authentication Test Summary:');
    console.log('- Supabase client: ✅ Working');
    console.log(`- Session management: ${newSession ? '✅' : '❌'}`);
    console.log(`- User metadata: ${newSession?.user?.user_metadata ? '✅' : '❌'}`);
    console.log(`- Avatar URL: ${newSession?.user?.user_metadata?.avatar_url ? '✅' : '❌'}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Navigate to http://localhost:3001');
    console.log('2. Try to sign in with an existing user (Google OAuth recommended)');
    console.log('3. Go to /dashboard to see if ProfileDropdown appears');
    console.log('4. If using the test user above, you may need to confirm the email first');
    
  } catch (error) {
    console.log(`❌ Auth flow test failed: ${error.message}`);
  }
}

testAuthFlow();