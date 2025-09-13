const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test storage buckets
    console.log('\n🪣 Testing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage access failed:', bucketsError.message);
      return;
    }
    
    console.log('✅ Storage access successful');
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    // Check if public_image bucket exists
    const publicImageBucket = buckets.find(b => b.name === 'public_image');
    if (publicImageBucket) {
      console.log('✅ public_image bucket exists');
      console.log('📊 Bucket details:', {
        name: publicImageBucket.name,
        id: publicImageBucket.id,
        public: publicImageBucket.public,
        file_size_limit: publicImageBucket.file_size_limit,
        allowed_mime_types: publicImageBucket.allowed_mime_types
      });
    } else {
      console.log('❌ public_image bucket not found');
      console.log('🔧 You need to run the migration: supabase db push');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
