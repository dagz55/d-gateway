#!/usr/bin/env node

/**
 * Debug Admin Route Issues
 * Quick diagnostic to identify admin route problems
 */

const http = require('http');
const { createClerkClient } = require('@clerk/backend');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'dagz55@gmail.com';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error('❌ Missing CLERK_SECRET_KEY');
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

async function debugAdminRoute() {
  console.log('🔍 ADMIN ROUTE DIAGNOSTIC');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check admin user status
    console.log('1️⃣ Checking admin user status...');
    const usersResponse = await clerkClient.users.getUserList({
      emailAddress: [ADMIN_EMAIL]
    });
    
    const users = usersResponse.data || usersResponse;
    if (!users || users.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const user = users[0];
    const isAdmin = user.publicMetadata?.role === 'admin';
    console.log(`✅ Admin user found: ${user.emailAddresses[0]?.emailAddress}`);
    console.log(`   Role: ${user.publicMetadata?.role || 'user'}`);
    console.log(`   Is Admin: ${isAdmin ? 'YES' : 'NO'}`);
    
    // 2. Test server response
    console.log('\n2️⃣ Testing server routes...');
    
    const routes = [
      { path: '/', name: 'Root' },
      { path: '/admin', name: 'Admin Root' },
      { path: '/admin/dashboard', name: 'Admin Dashboard' },
      { path: '/member/dashboard', name: 'Member Dashboard' }
    ];
    
    for (const route of routes) {
      try {
        const response = await makeRequest(`${BASE_URL}${route.path}`);
        const status = response.statusCode;
        const location = response.headers.location;
        
        console.log(`   ${route.name} (${route.path}):`);
        console.log(`     Status: ${status}`);
        if (location) {
          console.log(`     Redirects to: ${location}`);
        }
        
        if (status >= 400) {
          console.log(`     ❌ Error: ${status}`);
        } else if (status >= 300) {
          console.log(`     🔄 Redirect: ${status} → ${location}`);
        } else {
          console.log(`     ✅ OK: ${status}`);
        }
      } catch (error) {
        console.log(`   ${route.name}: ❌ ERROR - ${error.message}`);
      }
    }
    
    // 3. Check file structure
    console.log('\n3️⃣ Checking admin route files...');
    const fs = require('fs');
    const path = require('path');
    
    const adminFiles = [
      'app/admin/layout.tsx',
      'app/admin/page.tsx',
      'app/admin/dashboard/page.tsx'
    ];
    
    for (const file of adminFiles) {
      const fullPath = path.join(process.cwd(), file);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
    // 4. Middleware check
    console.log('\n4️⃣ Checking middleware configuration...');
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf8');
      const hasAdminRoutes = content.includes('isAdminRoute');
      const hasRoleCheck = content.includes('isUserAdmin');
      const hasAdminRedirect = content.includes('/admin/dashboard');
      
      console.log(`   Admin routes defined: ${hasAdminRoutes ? '✅ YES' : '❌ NO'}`);
      console.log(`   Role checking logic: ${hasRoleCheck ? '✅ YES' : '❌ NO'}`);
      console.log(`   Admin dashboard redirect: ${hasAdminRedirect ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ Middleware file not found');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('=' .repeat(50));
    
    if (!isAdmin) {
      console.log('❌ ISSUE: Admin user metadata not set correctly');
      console.log('   Solution: Run the admin setup script again');
    } else {
      console.log('✅ Admin user is configured correctly');
      console.log('🔄 Try the following steps:');
      console.log('   1. Sign out completely from the app');
      console.log('   2. Clear browser cache and cookies');
      console.log('   3. Sign back in with dagz55@gmail.com');
      console.log('   4. Check if you\'re redirected to /admin/dashboard');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', reject);
    req.end();
  });
}

debugAdminRoute();
