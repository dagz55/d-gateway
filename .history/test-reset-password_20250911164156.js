// Test script to verify reset password functionality
const testEmail = 'dagz55@gmail.com';

async function testResetPassword() {
  console.log('🧪 Testing Reset Password Functionality...\n');
  
  try {
    // Test 1: Valid email
    console.log('1. Testing with valid email:', testEmail);
    const response1 = await fetch('http://localhost:3002/api/auth/request-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const result1 = await response1.json();
    console.log('   Response:', JSON.stringify(result1, null, 2));
    console.log('   Status:', response1.status);
    console.log('   ✅ Valid email test:', result1.success ? 'PASSED' : 'FAILED');
    
    // Test 2: Invalid email format
    console.log('\n2. Testing with invalid email format: invalid-email');
    const response2 = await fetch('http://localhost:3002/api/auth/request-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email' }),
    });
    
    const result2 = await response2.json();
    console.log('   Response:', JSON.stringify(result2, null, 2));
    console.log('   Status:', response2.status);
    console.log('   ✅ Invalid email test:', result2.success ? 'PASSED' : 'FAILED');
    
    // Test 3: Empty email
    console.log('\n3. Testing with empty email:');
    const response3 = await fetch('http://localhost:3002/api/auth/request-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: '' }),
    });
    
    const result3 = await response3.json();
    console.log('   Response:', JSON.stringify(result3, null, 2));
    console.log('   Status:', response3.status);
    console.log('   ✅ Empty email test:', result3.success ? 'PASSED' : 'FAILED');
    
    console.log('\n🎉 Reset Password API Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testResetPassword();
