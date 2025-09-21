#!/usr/bin/env node

/**
 * Clerk Authentication Setup Script
 * This script helps set up Clerk authentication for the Zignal trading platform
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Clerk Authentication Setup for Zignal Trading Platform\n');

const envTemplate = `# Clerk Configuration - REQUIRED
# Get these from your Clerk Dashboard: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=PUBLISHABLE_KEY_PLACEHOLDER
CLERK_SECRET_KEY=SECRET_KEY_PLACEHOLDER

# JWT Configuration - REQUIRED (Generated automatically)
JWT_SECRET=a5f746bf4d8b9bc9a0c7582282204f8bcd7301470b946a784c489e980c47a89b

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Clerk URLs (Optional - auto-generated if not set)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration (Optional - for user data storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_if_needed
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_if_needed
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_if_needed

# Serverless Configuration
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
SERVERLESS_FUNCTIONS_URL=http://localhost:3000/api
AUTH_MICROSERVICE_URL=http://localhost:3000/api/auth

# Admin Users (comma-separated emails)
ALLOWED_ADMIN_EMAILS=admin@example.com,your-email@example.com

# Security
SECURITY_LOGGING_ENABLED=true
SECURITY_LOG_LEVEL=info`;

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupClerkAuth() {
  try {
    console.log('📋 This script will help you set up Clerk authentication.\n');
    
    // Check if .env.local already exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local file already exists.');
      const overwrite = await question('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled. Please manually update your .env.local file.');
        console.log('📖 See CLERK_SETUP_INSTRUCTIONS.md for manual setup steps.');
        rl.close();
        return;
      }
    }

    console.log('🔑 You need to get your Clerk keys from: https://dashboard.clerk.com/\n');
    console.log('Steps to get your keys:');
    console.log('1. Go to https://dashboard.clerk.com/');
    console.log('2. Create a new application or select existing one');
    console.log('3. Go to API Keys section');
    console.log('4. Copy your Publishable Key and Secret Key\n');

    const publishableKey = await question('Enter your Clerk Publishable Key (pk_test_...): ');
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      console.log('❌ Invalid publishable key. Must start with pk_test_ or pk_live_');
      rl.close();
      return;
    }

    const secretKey = await question('Enter your Clerk Secret Key (sk_test_...): ');
    if (!secretKey || !secretKey.startsWith('sk_')) {
      console.log('❌ Invalid secret key. Must start with sk_test_ or sk_live_');
      rl.close();
      return;
    }

    // Create .env.local file
    const envContent = envTemplate
      .replace('PUBLISHABLE_KEY_PLACEHOLDER', publishableKey)
      .replace('SECRET_KEY_PLACEHOLDER', secretKey);

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');

    console.log('\n🎯 Next Steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Visit http://localhost:3000 and test the Sign In button');
    console.log('3. Configure your Clerk application settings:');
    console.log('   - Add http://localhost:3000 to allowed origins');
    console.log('   - Set redirect URLs to /dashboard');
    console.log('4. Run: npm run check-env to verify setup');

    console.log('\n📖 For detailed instructions, see: CLERK_SETUP_INSTRUCTIONS.md');

  } catch (error) {
    console.error('❌ Error setting up Clerk authentication:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupClerkAuth();
