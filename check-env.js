#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Checks if all required WorkOS environment variables are set
 */

const requiredEnvVars = [
  'WORKOS_API_KEY',
  'WORKOS_CLIENT_ID', 
  'WORKOS_COOKIE_PASSWORD',
  'NEXT_PUBLIC_SITE_URL',
  'JWT_SECRET'
];

console.log('🔍 Checking WorkOS Environment Configuration...\n');

let allSet = true;
const missing = [];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: MISSING`);
    missing.push(envVar);
    allSet = false;
  } else {
    // Check length requirements for different secrets
    if (envVar === 'WORKOS_COOKIE_PASSWORD' && value.length !== 32) {
      console.log(`❌ ${envVar}: WRONG LENGTH (${value.length} chars, need exactly 32)`);
      missing.push(`${envVar} (wrong length)`);
      allSet = false;
    } else if (envVar === 'JWT_SECRET' && value.length < 32) {
      console.log(`❌ ${envVar}: TOO SHORT (${value.length} chars, need 32+)`);
      missing.push(`${envVar} (too short)`);
      allSet = false;
    } else {
      // Mask sensitive values
      const displayValue = envVar.includes('KEY') || envVar.includes('PASSWORD') || envVar.includes('SECRET')
        ? '***SET***' 
        : value;
      console.log(`✅ ${envVar}: ${displayValue}`);
    }
  }
});

if (!allSet) {
  console.log('\n🚨 Missing Required Environment Variables:');
  missing.forEach(envVar => {
    console.log(`   - ${envVar}`);
  });
  
  console.log('\n📝 Create .env.local with these variables:');
  console.log('WORKOS_API_KEY=sk_test_your_api_key_here');
  console.log('WORKOS_CLIENT_ID=client_your_client_id_here');
  console.log('WORKOS_COOKIE_PASSWORD=your_exactly_32_character_password');
  console.log('JWT_SECRET=your_32_plus_character_jwt_secret_here');
  console.log('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  
  console.log('\n🔑 Generate secrets with correct lengths:');
  console.log('npm run generate-secrets');
  console.log('');
  console.log('# Or manually:');
  console.log('# WORKOS_COOKIE_PASSWORD (exactly 32 chars):');
  console.log('node -e "console.log(require(\'crypto\').randomBytes(16).toString(\'hex\'))"');
  console.log('# JWT_SECRET (32+ chars):');
  console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('🚀 WorkOS authentication should work now.');
}
