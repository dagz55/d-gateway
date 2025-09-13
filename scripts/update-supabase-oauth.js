#!/usr/bin/env node

/**
 * Supabase OAuth Configuration Update Script
 * 
 * This script helps configure Supabase OAuth settings for port-robust development
 * 
 * Note: Some settings may require manual configuration in Supabase Dashboard
 * as they involve OAuth provider setup which requires admin access.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateOAuthConfiguration() {
  console.log('🔧 Supabase OAuth Configuration Update');
  console.log('=====================================');
  
  // Current development port
  const currentPort = process.env.PORT || '3002';
  const siteUrl = `http://localhost:${currentPort}`;
  const callbackUrl = `${siteUrl}/auth/callback`;
  
  console.log(`📍 Current Site URL: ${siteUrl}`);
  console.log(`📍 OAuth Callback URL: ${callbackUrl}`);
  
  try {
    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
      
    if (testError && !testError.message.includes('relation "user_profiles" does not exist')) {
      throw testError;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Note: OAuth provider settings require manual configuration
    console.log('\n📋 MANUAL CONFIGURATION REQUIRED:');
    console.log('================================');
    console.log('\n1. Go to your Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}`);
    
    console.log('\n2. Navigate to: Authentication → URL Configuration');
    console.log(`   - Set Site URL: ${siteUrl}`);
    console.log('   - Add Redirect URLs:');
    console.log('     • http://localhost:3002/auth/callback');
    console.log('     • http://localhost:3001/auth/callback');
    console.log('     • http://localhost:3000/auth/callback');
    
    console.log('\n3. Navigate to: Authentication → Providers → Google');
    console.log(`   - Ensure "Enable Google provider" is checked`);
    console.log(`   - Verify Client ID: ${process.env.GOOGLE_CLIENT_ID || '[FROM_ENV]'}`);
    console.log(`   - Verify Client Secret is set`);
    console.log(`   - Set Redirect URL: ${callbackUrl}`);
    
    console.log('\n4. In Google Cloud Console:');
    console.log('   - Go to APIs & Services → Credentials');
    console.log('   - Edit your OAuth 2.0 Client ID');
    console.log('   - Add to Authorized redirect URIs:');
    console.log(`     • ${callbackUrl}`);
    
    console.log('\n✅ Configuration URLs Generated Successfully!');
    console.log('🔄 Please complete the manual steps above to fix OAuth.');
    
  } catch (error) {
    console.error('❌ Error accessing Supabase:', error.message);
    console.log('\n📋 FALLBACK INSTRUCTIONS:');
    console.log('========================');
    console.log('1. Check your .env.local file has correct Supabase credentials');
    console.log('2. Manually update OAuth settings in Supabase Dashboard');
    console.log(`3. Use redirect URL: ${callbackUrl}`);
  }
}

// Run the configuration update
updateOAuthConfiguration().catch(console.error);