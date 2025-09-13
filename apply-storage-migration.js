const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applying Storage Migration...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20240101000003_storage_setup.sql', 'utf8');
    
    console.log('📄 Migration file loaded');
    
    // Execute the migration
    console.log('🚀 Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Try alternative approach - create bucket directly
      console.log('\n🔄 Trying alternative approach...');
      await createBucketDirectly();
      return;
    }
    
    console.log('✅ Migration executed successfully');
    
    // Verify bucket creation
    await verifyBucket();
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    
    // Try alternative approach
    console.log('\n🔄 Trying alternative approach...');
    await createBucketDirectly();
  }
}

async function createBucketDirectly() {
  try {
    console.log('🪣 Creating public_image bucket directly...');
    
    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('public_image', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (bucketError) {
      console.error('❌ Bucket creation failed:', bucketError.message);
      return;
    }
    
    console.log('✅ Bucket created successfully');
    
    // Verify bucket
    await verifyBucket();
    
  } catch (error) {
    console.error('❌ Direct bucket creation failed:', error.message);
  }
}

async function verifyBucket() {
  try {
    console.log('\n🔍 Verifying bucket...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Failed to list buckets:', error.message);
      return;
    }
    
    const publicImageBucket = buckets.find(b => b.name === 'public_image');
    
    if (publicImageBucket) {
      console.log('✅ public_image bucket verified');
      console.log('📊 Bucket details:', {
        name: publicImageBucket.name,
        id: publicImageBucket.id,
        public: publicImageBucket.public,
        file_size_limit: publicImageBucket.file_size_limit,
        allowed_mime_types: publicImageBucket.allowed_mime_types
      });
    } else {
      console.log('❌ public_image bucket not found');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

applyMigration();
