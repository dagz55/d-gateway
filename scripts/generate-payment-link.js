#!/usr/bin/env node

/**
 * Payment Link Generator Script
 * Generates test payment links for Zignal packages
 */

const http = require('http');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function generatePaymentLink() {
  try {
    colorLog('\n🔗 Zignal Payment Link Generator', 'cyan');
    colorLog('================================', 'cyan');
    
    // Get package details
    const packageName = await askQuestion('\n📦 Package Name (e.g., "Premium Trading Signals"): ');
    const amount = await askQuestion('💰 Amount (USD, e.g., 99.99): ');
    const description = await askQuestion('📝 Description: ');
    
    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount. Please enter a positive number.');
    }
    
    colorLog('\n🔄 Generating payment link...', 'yellow');
    
    // Make API request to create payment link
    const paymentData = {
      amount: numericAmount,
      currency: 'usd',
      description: description,
      packageName: packageName,
      successUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };
    
    const response = await makeApiRequest('/api/payment-links', 'POST', paymentData);
    
    if (response.success) {
      colorLog('\n✅ Payment Link Generated Successfully!', 'green');
      colorLog('=====================================', 'green');
      colorLog(`\n🔗 Payment Link: ${response.paymentLink.url}`, 'bright');
      colorLog(`💰 Amount: $${response.paymentLink.amount} ${response.paymentLink.currency.toUpperCase()}`, 'bright');
      colorLog(`📦 Package: ${packageName}`, 'bright');
      colorLog(`📝 Description: ${description}`, 'bright');
      colorLog(`🆔 Link ID: ${response.paymentLink.id}`, 'bright');
      colorLog(`📅 Created: ${response.paymentLink.created}`, 'bright');
      
      colorLog('\n📋 Test Instructions:', 'cyan');
      colorLog('1. Copy the payment link above', 'yellow');
      colorLog('2. Open it in a browser', 'yellow');
      colorLog('3. Use Stripe test card: 4242 4242 4242 4242', 'yellow');
      colorLog('4. Use any future expiry date and CVC', 'yellow');
      colorLog('5. Use any name and email', 'yellow');
      
      // Save to file
      const fs = require('fs');
      const paymentLog = {
        timestamp: new Date().toISOString(),
        package: packageName,
        amount: numericAmount,
        description: description,
        paymentLink: response.paymentLink.url,
        linkId: response.paymentLink.id
      };
      
      fs.appendFileSync('payment-links.log', JSON.stringify(paymentLog, null, 2) + '\n');
      colorLog('\n💾 Payment link saved to payment-links.log', 'blue');
      
    } else {
      colorLog('\n❌ Failed to generate payment link', 'red');
      colorLog(`Error: ${response.message}`, 'red');
    }
    
  } catch (error) {
    colorLog('\n❌ Error generating payment link:', 'red');
    colorLog(error.message, 'red');
    
    if (error.message.includes('Unauthorized')) {
      colorLog('\n💡 Make sure you are signed in to the application', 'yellow');
      colorLog('   Visit: http://localhost:3000/sign-in', 'yellow');
    }
  } finally {
    rl.close();
  }
}

function makeApiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Connection error: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runValidation() {
  try {
    colorLog('\n🧪 Running System Validation...', 'cyan');
    colorLog('==============================', 'cyan');
    
    const response = await makeApiRequest('/api/test-validation');
    
    if (response.success) {
      const { validation } = response;
      
      colorLog(`\n📊 Validation Results (${validation.summary.total} tests)`, 'bright');
      colorLog(`✅ Passed: ${validation.summary.passed}`, 'green');
      colorLog(`❌ Failed: ${validation.summary.failed}`, 'red');
      colorLog(`⏭️  Skipped: ${validation.summary.total - validation.summary.passed - validation.summary.failed}`, 'yellow');
      
      colorLog('\n📋 Test Details:', 'cyan');
      validation.tests.forEach(test => {
        const status = test.status === 'PASS' ? '✅' : 
                      test.status === 'FAIL' ? '❌' : '⏭️';
        const color = test.status === 'PASS' ? 'green' : 
                     test.status === 'FAIL' ? 'red' : 'yellow';
        colorLog(`${status} ${test.name}: ${test.message}`, color);
      });
      
      if (response.recommendations && response.recommendations.length > 0) {
        colorLog('\n💡 Recommendations:', 'cyan');
        response.recommendations.forEach(rec => {
          colorLog(`   ${rec}`, 'yellow');
        });
      }
      
      return validation.summary.failed === 0;
    } else {
      colorLog('\n❌ Validation failed:', 'red');
      colorLog(response.message, 'red');
      return false;
    }
  } catch (error) {
    colorLog('\n❌ Validation error:', 'red');
    colorLog(error.message, 'red');
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate') || args.includes('-v')) {
    await runValidation();
  } else if (args.includes('--help') || args.includes('-h')) {
    colorLog('\n🔗 Zignal Payment Link Generator', 'cyan');
    colorLog('Usage:', 'bright');
    colorLog('  node scripts/generate-payment-link.js [options]', 'yellow');
    colorLog('\nOptions:', 'bright');
    colorLog('  --validate, -v    Run system validation tests', 'yellow');
    colorLog('  --help, -h        Show this help message', 'yellow');
    colorLog('\nExamples:', 'bright');
    colorLog('  node scripts/generate-payment-link.js', 'yellow');
    colorLog('  node scripts/generate-payment-link.js --validate', 'yellow');
  } else {
    await generatePaymentLink();
  }
}

main().catch(console.error);
