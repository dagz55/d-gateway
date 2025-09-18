#!/usr/bin/env node

/**
 * WorkOS Environment Setup Script
 * 
 * This script helps you set up the required environment variables
 * for the WorkOS + Supabase integration.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bold');
  console.log('='.repeat(50));
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Generate cookie password
function generateCookiePassword() {
  const crypto = require('crypto');
  return crypto.randomBytes(24).toString('base64');
}

// Main setup function
async function setupEnvironment() {
  logSection('WorkOS + Supabase Environment Setup');
  
  logInfo('This script will help you set up the required environment variables.');
  logInfo('You can skip any field by pressing Enter (defaults will be used).\n');

  const envVars = {};

  // WorkOS Configuration
  logSection('WorkOS Configuration');
  
  envVars.WORKOS_API_KEY = await askQuestion('WorkOS API Key (starts with sk_): ');
  if (!envVars.WORKOS_API_KEY) {
    logWarning('WorkOS API Key is required!');
    process.exit(1);
  }

  envVars.WORKOS_CLIENT_ID = await askQuestion('WorkOS Client ID (starts with client_): ');
  if (!envVars.WORKOS_CLIENT_ID) {
    logWarning('WorkOS Client ID is required!');
    process.exit(1);
  }

  envVars.WORKOS_COOKIE_PASSWORD = await askQuestion(`WorkOS Cookie Password (32 chars) [${generateCookiePassword()}]: `);
  if (!envVars.WORKOS_COOKIE_PASSWORD) {
    envVars.WORKOS_COOKIE_PASSWORD = generateCookiePassword();
  }

  envVars.WORKOS_REDIRECT_URI = await askQuestion('Redirect URI [http://localhost:3000/api/auth/workos/callback]: ');
  if (!envVars.WORKOS_REDIRECT_URI) {
    envVars.WORKOS_REDIRECT_URI = 'http://localhost:3000/api/auth/workos/callback';
  }

  envVars.WORKOS_LOGIN_ENDPOINT = await askQuestion('Login Endpoint [http://localhost:3000/api/auth/workos/login]: ');
  if (!envVars.WORKOS_LOGIN_ENDPOINT) {
    envVars.WORKOS_LOGIN_ENDPOINT = 'http://localhost:3000/api/auth/workos/login';
  }

  envVars.WORKOS_LOGOUT_REDIRECT_URI = await askQuestion('Logout Redirect URI [http://localhost:3000/]: ');
  if (!envVars.WORKOS_LOGOUT_REDIRECT_URI) {
    envVars.WORKOS_LOGOUT_REDIRECT_URI = 'http://localhost:3000/';
  }

  envVars.WORKOS_ISSUER_URL = await askQuestion(`WorkOS Issuer URL [https://api.workos.com/user_management/${envVars.WORKOS_CLIENT_ID}]: `);
  if (!envVars.WORKOS_ISSUER_URL) {
    envVars.WORKOS_ISSUER_URL = `https://api.workos.com/user_management/${envVars.WORKOS_CLIENT_ID}`;
  }

  // Supabase Configuration
  logSection('Supabase Configuration');
  
  envVars.NEXT_PUBLIC_SUPABASE_URL = await askQuestion('Supabase URL (https://your-project.supabase.co): ');
  if (!envVars.NEXT_PUBLIC_SUPABASE_URL) {
    logWarning('Supabase URL is required for database integration!');
  }

  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = await askQuestion('Supabase Anon Key: ');
  if (!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logWarning('Supabase Anon Key is required for database integration!');
  }

  // App Configuration
  logSection('App Configuration');
  
  envVars.NEXT_PUBLIC_APP_URL = await askQuestion('App URL [http://localhost:3000]: ');
  if (!envVars.NEXT_PUBLIC_APP_URL) {
    envVars.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  }

  // Generate .env.local file
  logSection('Generating .env.local File');
  
  const envContent = `# WorkOS Configuration
WORKOS_API_KEY=${envVars.WORKOS_API_KEY}
WORKOS_CLIENT_ID=${envVars.WORKOS_CLIENT_ID}
WORKOS_COOKIE_PASSWORD=${envVars.WORKOS_COOKIE_PASSWORD}
WORKOS_REDIRECT_URI=${envVars.WORKOS_REDIRECT_URI}
WORKOS_LOGIN_ENDPOINT=${envVars.WORKOS_LOGIN_ENDPOINT}
WORKOS_LOGOUT_REDIRECT_URI=${envVars.WORKOS_LOGOUT_REDIRECT_URI}
WORKOS_ISSUER_URL=${envVars.WORKOS_ISSUER_URL}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}

# App Configuration
NEXT_PUBLIC_APP_URL=${envVars.NEXT_PUBLIC_APP_URL}
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    logSuccess('.env.local file created successfully!');
  } catch (error) {
    logError(`Failed to create .env.local file: ${error.message}`);
    process.exit(1);
  }

  // Display next steps
  logSection('Next Steps');
  
  logInfo('1. Configure your WorkOS Dashboard:');
  logInfo('   - Add redirect URIs: ' + envVars.WORKOS_REDIRECT_URI);
  logInfo('   - Set login endpoint: ' + envVars.WORKOS_LOGIN_ENDPOINT);
  logInfo('   - Set logout redirect: ' + envVars.WORKOS_LOGOUT_REDIRECT_URI);
  logInfo('   - Create JWT template (see SETUP_CHECKLIST.md)');
  
  logInfo('2. Configure your Supabase Dashboard:');
  logInfo('   - Add WorkOS as third-party provider');
  logInfo('   - Issuer URL: ' + envVars.WORKOS_ISSUER_URL);
  
  logInfo('3. Test the integration:');
  logInfo('   npm run test:workos');
  logInfo('   npm run dev');
  
  logSuccess('Setup complete! Check SETUP_CHECKLIST.md for detailed instructions.');
  
  rl.close();
}

// Run setup
setupEnvironment().catch(console.error);
