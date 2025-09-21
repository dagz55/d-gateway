#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Checks if all required Clerk environment variables are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY', 
  'NEXT_PUBLIC_SITE_URL',
  'JWT_SECRET'
];

console.log('🔍 Checking Clerk Environment Configuration...\n');

let allSet = true;
const missing = [];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: MISSING`);
    missing.push(envVar);
    allSet = false;
  } else {
    // Check length requirements for JWT_SECRET
    if (envVar === 'JWT_SECRET' && value.length < 32) {
      console.log(`❌ ${envVar}: TOO SHORT (${value.length} chars, need 32+)`);
      missing.push(`${envVar} (too short)`);
      allSet = false;
    } else {
      // Mask sensitive values
      const displayValue = envVar.includes('KEY') || envVar.includes('SECRET')
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
  console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here');
  console.log('CLERK_SECRET_KEY=sk_test_your_secret_key_here');
  console.log('JWT_SECRET=your_32_plus_character_jwt_secret_here');
  console.log('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  
  console.log('\n🔑 Generate JWT secret:');
  console.log('npm run generate-secrets');
  console.log('');
  console.log('# Or manually:');
  console.log('# JWT_SECRET (32+ chars):');
  console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('🚀 Clerk authentication should work now.');
}