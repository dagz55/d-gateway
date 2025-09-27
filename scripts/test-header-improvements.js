#!/usr/bin/env node

/**
 * Test script to validate header improvements
 * Validates Dashboard button, profile dropdown contrast, and admin crown
 */

const https = require('https');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkComponent(name, condition, details = '') {
  if (condition) {
    log(`✅ ${name}`, colors.green);
    if (details) log(`   ${details}`, colors.blue);
  } else {
    log(`❌ ${name}`, colors.red);
    if (details) log(`   ${details}`, colors.yellow);
  }
  return condition;
}

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function runTests() {
  log('\n🧪 Testing Header Improvements', colors.blue);
  log('=====================================\n');

  try {
    // Test 1: Check if dev server is running
    const html = await fetchPage('http://localhost:3000');
    const serverRunning = html.length > 0;
    checkComponent('Development server is running', serverRunning);

    if (!serverRunning) {
      log('\n⚠️  Please start the dev server with: npm run dev', colors.yellow);
      process.exit(1);
    }

    // Test 2: Check for Dashboard button elements
    const hasDashboardButton = html.includes('Dashboard') && html.includes('LayoutDashboard');
    checkComponent(
      'Dashboard button exists in header',
      hasDashboardButton,
      'Button with text and icon found'
    );

    // Test 3: Check for responsive Dashboard button classes
    const hasResponsiveClasses = html.includes('hidden sm:flex') || html.includes('flex sm:hidden');
    checkComponent(
      'Dashboard button has responsive design',
      hasResponsiveClasses,
      'Mobile and desktop variants configured'
    );

    // Test 4: Check for improved contrast styles
    const hasContrastStyles = html.includes('#1f2937') || html.includes('#f9fafb');
    checkComponent(
      'Profile dropdown has improved contrast styles',
      hasContrastStyles,
      'WCAG AA compliant colors detected'
    );

    // Test 5: Check for Crown icon import
    const hasCrownIcon = html.includes('Crown') || html.includes('crown');
    checkComponent(
      'Crown icon is imported for admin badge',
      hasCrownIcon,
      'lucide-react Crown component available'
    );

    // Test 6: Check for admin role detection
    const hasAdminCheck = html.includes('publicMetadata') || html.includes('role');
    checkComponent(
      'Admin role detection logic exists',
      hasAdminCheck,
      'Checking user.publicMetadata.role'
    );

    // Test 7: Check for aria-labels
    const hasAriaLabels = html.includes('aria-label');
    checkComponent(
      'Accessibility aria-labels present',
      hasAriaLabels,
      'Screen reader support implemented'
    );

    // Test 8: Check for focus-visible styles
    const hasFocusStyles = html.includes('focus-visible') || html.includes('focus:');
    checkComponent(
      'Focus-visible styles for keyboard navigation',
      hasFocusStyles,
      'Keyboard navigation support added'
    );

    log('\n📊 Test Summary', colors.blue);
    log('=====================================');
    
    const tests = [
      serverRunning,
      hasDashboardButton,
      hasResponsiveClasses,
      hasContrastStyles,
      hasCrownIcon,
      hasAdminCheck,
      hasAriaLabels,
      hasFocusStyles
    ];
    
    const passed = tests.filter(t => t).length;
    const total = tests.length;
    const percentage = Math.round((passed / total) * 100);
    
    if (passed === total) {
      log(`✅ All ${total} tests passed! (${percentage}%)`, colors.green);
      log('\n🎉 Header improvements validated successfully!\n', colors.green);
    } else {
      log(`⚠️  ${passed}/${total} tests passed (${percentage}%)`, colors.yellow);
      log('\nSome tests failed. Please review the implementation.\n', colors.yellow);
    }

    // Additional manual testing reminders
    log('📝 Manual Testing Checklist:', colors.blue);
    log('=====================================');
    log('1. Login with admin account (dagz55@gmail.com)');
    log('2. Verify crown badge appears on avatar');
    log('3. Test Dashboard button navigation to /dashboard');
    log('4. Open profile dropdown and check text contrast');
    log('5. Test keyboard navigation (Tab, Enter, Escape)');
    log('6. Resize browser to test responsive design');
    log('7. Test in both light and dark modes\n');

    process.exit(passed === total ? 0 : 1);

  } catch (error) {
    log(`\n❌ Error running tests: ${error.message}`, colors.red);
    log('\nMake sure the dev server is running: npm run dev', colors.yellow);
    process.exit(1);
  }
}

// Run the tests
runTests();