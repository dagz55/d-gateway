#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Google OAuth Fix Script');
console.log('=========================\n');

// Check environment variables
function checkEnvVariables() {
  console.log('📋 Checking environment variables...\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('Please create .env.local with your Supabase credentials.');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    return false;
  }
  
  // Extract values
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const siteUrl = envContent.match(/NEXT_PUBLIC_SITE_URL=(.+)/)?.[1]?.trim();
  
  console.log('✅ Environment variables found:');
  console.log(`   - Supabase URL: ${supabaseUrl}`);
  console.log(`   - Site URL: ${siteUrl}`);
  console.log('');
  
  return { supabaseUrl, siteUrl };
}

// Generate redirect URIs
function generateRedirectURIs(config) {
  const { supabaseUrl, siteUrl } = config;
  
  console.log('📝 Required Google OAuth Redirect URIs:\n');
  console.log('Add these to Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID:\n');
  
  const uris = [
    `${supabaseUrl}/auth/v1/callback`,
    'http://localhost:3000/auth/callback',
    'http://localhost:3001/auth/callback', 
    'http://localhost:3002/auth/callback'
  ];
  
  // Add production URL if it's set and not localhost
  if (siteUrl && !siteUrl.includes('localhost')) {
    uris.push(`${siteUrl}/auth/callback`);
  }
  
  uris.forEach(uri => console.log(`   ✓ ${uri}`));
  console.log('');
  
  return uris;
}

// Check auth callback route
function checkAuthCallbackRoute() {
  console.log('🔍 Checking auth callback route...\n');
  
  const callbackPath = path.join(process.cwd(), 'src/app/auth/callback/route.ts');
  const callbackPagePath = path.join(process.cwd(), 'src/app/auth/callback/page.tsx');
  
  if (fs.existsSync(callbackPath) || fs.existsSync(callbackPagePath)) {
    console.log('✅ Auth callback route found');
  } else {
    console.log('⚠️  Auth callback route not found. Creating one...');
    
    // Create callback directory
    const callbackDir = path.join(process.cwd(), 'src/app/auth/callback');
    if (!fs.existsSync(callbackDir)) {
      fs.mkdirSync(callbackDir, { recursive: true });
    }
    
    // Create route handler
    const routeContent = `import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(\`\${origin}/dashboard\`);
}
`;
    
    fs.writeFileSync(callbackPath, routeContent);
    console.log('✅ Created auth callback route');
  }
  console.log('');
}

// Main execution
async function main() {
  const config = checkEnvVariables();
  
  if (!config) {
    console.error('\n❌ Please fix the environment variables and run this script again.');
    process.exit(1);
  }
  
  generateRedirectURIs(config);
  checkAuthCallbackRoute();
  
  console.log('📋 Next Steps:');
  console.log('==============\n');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Add the redirect URIs listed above to your OAuth 2.0 Client');
  console.log('3. Copy your Client ID and Client Secret');
  console.log('4. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.log('5. Navigate to Authentication > Providers > Google');
  console.log('6. Enable Google provider and paste your credentials');
  console.log('7. Save the changes');
  console.log('8. Wait 5-10 minutes for changes to propagate');
  console.log('9. Clear browser cache and test the login');
  console.log('');
  console.log('✅ Script completed successfully!');
}

main().catch(console.error);