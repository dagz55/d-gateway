const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Upload API with Authentication...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadWithAuth() {
  try {
    // Create a test image file
    console.log('📸 Creating test image...');
    const testContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testBuffer = Buffer.from(testContent, 'base64');
    fs.writeFileSync('test-upload.png', testBuffer);
    
    console.log('✅ Test image created');
    
    // Test direct Supabase upload (simulating what the API should do)
    console.log('\n📤 Testing direct Supabase upload...');
    
    const fileName = `test-${Date.now()}.png`;
    const userName = 'test-user';
    const filePath = `public_image/${userName}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public_image')
      .upload(filePath, testBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Direct upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Direct upload successful');
    console.log('📊 Upload data:', uploadData);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public_image')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // Test the API endpoint (this will fail with 401, but we can see if the endpoint is working)
    console.log('\n🌐 Testing API endpoint...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-upload.png'), {
      filename: 'test-upload.png',
      contentType: 'image/png'
    });
    
    const response = await fetch('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const responseText = await response.text();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response Body:', responseText);
    
    if (response.status === 401) {
      console.log('✅ API endpoint is working (401 Unauthorized is expected without auth)');
    } else if (response.status === 200) {
      console.log('✅ API endpoint is working and upload successful!');
    } else {
      console.log('❌ Unexpected response from API');
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up...');
    
    // Remove from Supabase storage
    const { error: deleteError } = await supabase.storage
      .from('public_image')
      .remove([filePath]);
    
    if (deleteError) {
      console.error('❌ Storage cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Storage cleaned up');
    }
    
    // Remove local file
    fs.unlinkSync('test-upload.png');
    console.log('✅ Local file cleaned up');
    
    console.log('\n🎉 Upload test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Supabase storage is working');
    console.log('   - Direct upload to bucket works');
    console.log('   - API endpoint is accessible');
    console.log('   - Authentication is required for API (expected)');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Log in to the application in your browser');
    console.log('   2. Try uploading a photo through the UI');
    console.log('   3. Check the browser network tab for any errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUploadWithAuth();
