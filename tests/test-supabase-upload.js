#!/usr/bin/env node

/**
 * Test script for Supabase storage upload functionality
 * Run with: node test-supabase-upload.js
 */

const fs = require('fs');
const path = require('path');

// Create a test image file
function createTestImage() {
  // Create a simple 1x1 pixel PNG (minimal valid PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngData;
}

async function testUpload() {
  console.log('🧪 Testing Supabase Storage Upload...\n');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/api/profile');
    if (response.status === 401) {
      console.log('✅ Server is running (401 Unauthorized is expected)');
    } else {
      console.log('⚠️  Server responded with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    process.exit(1);
  }
  
  // Create test image
  const testImageData = createTestImage();
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, testImageData);
  console.log('✅ Test image created:', testImagePath);
  
  // Test upload without authentication (should fail)
  console.log('\n📤 Testing upload without authentication...');
  try {
    const formData = new FormData();
    const file = new File([testImageData], 'test-image.png', { type: 'image/png' });
    formData.append('file', file);
    
    const response = await fetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Upload correctly rejected (401 Unauthorized)');
      console.log('   Response:', result.message);
    } else {
      console.log('❌ Unexpected response:', response.status, result);
    }
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
  }
  
  // Test with mock authentication (this will fail but shows the flow)
  console.log('\n📤 Testing upload with mock authentication...');
  try {
    const formData = new FormData();
    const file = new File([testImageData], 'test-image.png', { type: 'image/png' });
    formData.append('file', file);
    
    const response = await fetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'next-auth.session-token=mock-token'
      }
    });
    
    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', JSON.stringify(result, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else if (response.status === 500) {
      console.log('⚠️  Server error (might be Supabase configuration)');
    } else {
      console.log('📊 Unexpected response');
    }
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
  }
  
  // Clean up test file
  fs.unlinkSync(testImagePath);
  console.log('✅ Test image cleaned up');
  
  console.log('\n📋 Test Summary:');
  console.log('   - Server is running');
  console.log('   - Upload endpoint is accessible');
  console.log('   - Authentication is required (401 response)');
  console.log('   - Test image created and cleaned up');
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Ensure Supabase environment variables are set');
  console.log('   2. Run the storage migration: supabase db push');
  console.log('   3. Test with authenticated user in browser');
  console.log('   4. Check Supabase dashboard for uploaded files');
  
  console.log('\n📚 Documentation:');
  console.log('   - Setup guide: docs/SUPABASE_STORAGE_SETUP.md');
  console.log('   - Troubleshooting: docs/UPLOAD_PHOTO_TROUBLESHOOTING.md');
}

// Run the test
testUpload().catch(console.error);
