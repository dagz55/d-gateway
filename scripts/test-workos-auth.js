#!/usr/bin/env node

/**
 * WorkOS AuthKit Implementation Test Script
 * 
 * This script validates the WorkOS AuthKit implementation by:
 * 1. Checking environment variables
 * 2. Testing API endpoints
 * 3. Validating configuration
 */

const https = require('https');
const http = require('http');

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

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bold');
  console.log('='.repeat(50));
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

// Test environment variables
function testEnvironmentVariables() {
  logSection('Testing Environment Variables');
  
  const requiredVars = [
    'WORKOS_API_KEY',
    'WORKOS_CLIENT_ID',
    'WORKOS_COOKIE_PASSWORD'
  ];
  
  const optionalVars = [
    'WORKOS_REDIRECT_URI',
    'WORKOS_LOGIN_ENDPOINT',
    'WORKOS_LOGOUT_REDIRECT_URI',
    'WORKOS_ISSUER_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
      
      // Special validation for cookie password
      if (varName === 'WORKOS_COOKIE_PASSWORD') {
        if (process.env[varName].length === 32) {
          logSuccess(`${varName} has correct length (32 characters)`);
        } else {
          logError(`${varName} must be exactly 32 characters (current: ${process.env[varName].length})`);
          allRequired = false;
        }
      }
    } else {
      logError(`${varName} is not set`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set: ${process.env[varName]}`);
    } else {
      logWarning(`${varName} is not set (using default)`);
    }
  });
  
  return allRequired;
}

// Test API endpoints
async function testAPIEndpoints() {
  logSection('Testing API Endpoints');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoints = [
    { path: '/api/auth/workos/login', method: 'GET', expectedStatus: 302 },
    { path: '/api/auth/workos/me', method: 'GET', expectedStatus: 401 },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint.path}`;
      logInfo(`Testing ${endpoint.method} ${url}`);
      
      const response = await makeRequest(url, endpoint.method);
      
      if (response.statusCode === endpoint.expectedStatus) {
        logSuccess(`${endpoint.path} returned expected status ${response.statusCode}`);
      } else {
        logError(`${endpoint.path} returned ${response.statusCode}, expected ${endpoint.expectedStatus}`);
      }
    } catch (error) {
      logError(`${endpoint.path} failed: ${error.message}`);
    }
  }
}

// Make HTTP request
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const options = {
      method,
      timeout: 5000
    };
    
    const req = client.request(url, options, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Test WorkOS configuration
function testWorkOSConfiguration() {
  logSection('Testing WorkOS Configuration');
  
  try {
    // Check if WorkOS API key format is correct
    const apiKey = process.env.WORKOS_API_KEY;
    if (apiKey && apiKey.startsWith('sk_')) {
      logSuccess('WorkOS API key format looks correct');
    } else {
      logError('WorkOS API key should start with "sk_"');
    }
    
    // Check if WorkOS Client ID format is correct
    const clientId = process.env.WORKOS_CLIENT_ID;
    if (clientId && clientId.startsWith('client_')) {
      logSuccess('WorkOS Client ID format looks correct');
    } else {
      logError('WorkOS Client ID should start with "client_"');
    }
    
    // Check redirect URI format
    const redirectUri = process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/api/auth/workos/callback';
    if (redirectUri.includes('/api/auth/workos/callback')) {
      logSuccess('Redirect URI format looks correct');
    } else {
      logWarning('Redirect URI should end with /api/auth/workos/callback');
    }
    
    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      logSuccess('Supabase configuration found');
      if (supabaseUrl.includes('.supabase.co')) {
        logSuccess('Supabase URL format looks correct');
      } else {
        logWarning('Supabase URL should be in format: https://your-project.supabase.co');
      }
    } else {
      logWarning('Supabase configuration not found - WorkOS will work standalone');
    }
    
  } catch (error) {
    logError(`Configuration test failed: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  log('WorkOS AuthKit Implementation Test', 'bold');
  log('=====================================', 'bold');
  
  const envTest = testEnvironmentVariables();
  testWorkOSConfiguration();
  
  if (envTest) {
    await testAPIEndpoints();
  } else {
    logWarning('Skipping API tests due to missing environment variables');
  }
  
  logSection('Test Summary');
  
  if (envTest) {
    logSuccess('WorkOS AuthKit implementation appears to be correctly configured!');
    logInfo('Next steps:');
    logInfo('1. Start your development server: npm run dev');
    logInfo('2. Navigate to http://localhost:3000');
    logInfo('3. Test the authentication flow');
    logInfo('4. Configure redirect URIs in your WorkOS dashboard');
  } else {
    logError('Please fix the environment variable issues before testing');
    logInfo('See WORKOS_SETUP.md for detailed setup instructions');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
