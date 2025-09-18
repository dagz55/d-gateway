const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspectProfilesSchema() {
  console.log('🔍 Inspecting Profiles Table Schema...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // First, let's try to get the table structure by querying information_schema
    console.log('🏗️  Checking table structure...');
    
    try {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');
        
      if (error) {
        console.log('❌ Error getting schema info:', error.message);
      } else {
        console.log('✅ Profiles table columns:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (err) {
      console.log('❌ Error accessing information_schema:', err.message);
    }

    // Try a simple select to see what data we get
    console.log('\n📊 Sample data from profiles table:');
    try {
      const { data: sampleProfiles, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3);
        
      if (sampleError) {
        console.log('❌ Error getting sample data:', sampleError.message);
      } else {
        console.log(`✅ Found ${sampleProfiles.length} profiles`);
        if (sampleProfiles.length > 0) {
          console.log('Sample profile structure:');
          console.log(JSON.stringify(sampleProfiles[0], null, 2));
        }
      }
    } catch (err) {
      console.log('❌ Error getting sample data:', err.message);
    }

    // Try to insert a minimal record to see what's required
    console.log('\n🧪 Testing minimal insert...');
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
      
      const { data: testInsert, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId
        })
        .select()
        .single();
        
      if (insertError) {
        console.log('❌ Test insert failed:', insertError.message);
        console.log('   This tells us what columns are required');
      } else {
        console.log('✅ Test insert succeeded (unexpected)');
        // Clean up the test record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId);
      }
    } catch (err) {
      console.log('❌ Test insert error:', err.message);
    }

    // Check what happens if we try different field names
    console.log('\n🔄 Testing different field combinations...');
    
    const testFields = [
      { id: '11111111-1111-1111-1111-111111111111', full_name: 'Test User' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Test User 2' },
      { id: '33333333-3333-3333-3333-333333333333', username: 'testuser3' },
    ];
    
    for (const testField of testFields) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert(testField)
          .select()
          .single();
          
        if (error) {
          console.log(`❌ Failed to insert with fields ${Object.keys(testField).join(', ')}: ${error.message}`);
        } else {
          console.log(`✅ Success with fields: ${Object.keys(testField).join(', ')}`);
          // Clean up
          await supabase.from('profiles').delete().eq('id', testField.id);
        }
      } catch (err) {
        console.log(`❌ Error testing ${Object.keys(testField).join(', ')}: ${err.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Schema inspection failed: ${error.message}`);
  }
}

inspectProfilesSchema();