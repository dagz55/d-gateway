const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🪣 Testing Supabase Storage...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    // List buckets
    console.log('\n📦 Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
      return;
    }
    
    console.log('✅ Buckets retrieved successfully');
    console.log('📊 Available buckets:', buckets.map(b => b.name));
    
    // Check if public_image bucket exists
    const publicImageBucket = buckets.find(b => b.name === 'public_image');
    if (!publicImageBucket) {
      console.log('❌ public_image bucket not found');
      return;
    }
    
    console.log('✅ public_image bucket found');
    console.log('📊 Bucket details:', {
      name: publicImageBucket.name,
      id: publicImageBucket.id,
      public: publicImageBucket.public,
      file_size_limit: publicImageBucket.file_size_limit,
      allowed_mime_types: publicImageBucket.allowed_mime_types
    });
    
    // Test upload
    console.log('\n📤 Testing file upload...');
    
    // Create a test file
    const testContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testBuffer = Buffer.from(testContent, 'base64');
    
    const fileName = `test-${Date.now()}.png`;
    const filePath = `test-user/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public_image')
      .upload(filePath, testBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload successful');
    console.log('📊 Upload data:', uploadData);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public_image')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // Test file listing
    console.log('\n📋 Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('public_image')
      .list('test-user');
    
    if (listError) {
      console.error('❌ List failed:', listError.message);
    } else {
      console.log('✅ File listing successful');
      console.log('📊 Files in test-user folder:', files.map(f => f.name));
    }
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('public_image')
      .remove([filePath]);
    
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('\n🎉 Storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStorage();
