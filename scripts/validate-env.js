#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present
 * and provides helpful error messages for missing variables.
 */

const requiredEnvVars = {
  // Clerk Authentication (Required)
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'Clerk publishable key for authentication',
  'CLERK_SECRET_KEY': 'Clerk secret key for server-side operations',
  
  // Supabase Database (Required)
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
  
  // Site Configuration (Required)
  'NEXT_PUBLIC_SITE_URL': 'Site URL for OAuth redirects',
  'JWT_SECRET': 'JWT secret for token signing',
  
  // Clerk URLs (Optional - have defaults)
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': 'Clerk sign-in URL (defaults to /sign-in)',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': 'Clerk sign-up URL (defaults to /sign-up)',
};

const optionalEnvVars = {
  'COINGECKO_API_KEY': 'CoinGecko API key for crypto data',
  'ALLOWED_ADMIN_EMAILS': 'Comma-separated list of admin emails',
  'NEXT_PUBLIC_VERCEL_URL': 'Vercel deployment URL',
  'VERCEL_URL': 'Vercel URL for current deployment',
};

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  let hasErrors = false;
  const missingRequired = [];
  const missingOptional = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[varName]) {
      missingRequired.push({ name: varName, description });
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}`);
    }
  }
  
  // Check optional variables
  for (const [varName, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[varName]) {
      missingOptional.push({ name: varName, description });
    } else {
      console.log(`✅ ${varName} (optional)`);
    }
  }
  
  console.log('\n');
  
  if (missingRequired.length > 0) {
    console.error('❌ Missing Required Environment Variables:');
    missingRequired.forEach(({ name, description }) => {
      console.error(`   • ${name}: ${description}`);
    });
    console.error('\n🚨 Build will fail without these variables!\n');
  }
  
  if (missingOptional.length > 0) {
    console.warn('⚠️  Missing Optional Environment Variables:');
    missingOptional.forEach(({ name, description }) => {
      console.warn(`   • ${name}: ${description}`);
    });
    console.warn('\n💡 These variables are optional but recommended for full functionality.\n');
  }
  
  if (hasErrors) {
    console.error('🔧 To fix this issue:');
    console.error('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.error('2. Add the missing required variables');
    console.error('3. Ensure they are enabled for Production environment');
    console.error('4. Redeploy your application\n');
    
    console.error('📋 Required Variables for Vercel:');
    missingRequired.forEach(({ name }) => {
      console.error(`   ${name}=your_value_here`);
    });
    
    process.exit(1);
  }
  
  console.log('🎉 All required environment variables are present!');
  console.log('✅ Ready for deployment');
}

// Run validation
validateEnvironment();
