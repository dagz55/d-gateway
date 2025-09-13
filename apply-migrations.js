const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function applyMigrations() {
  console.log('🚀 Applying Supabase migrations...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const migrations = [
      '20240101000000_initial_schema.sql',
      '20240101000001_rls_policies.sql', 
      '20240101000002_auth_triggers.sql'
    ];
    
    for (const migration of migrations) {
      console.log(`📄 Applying ${migration}...`);
      
      const migrationPath = path.join('supabase/migrations', migration);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Split SQL by semicolons and execute statements individually
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Use the from() method to execute raw SQL
            const { error } = await supabase
              .from('_')
              .select('*')
              .limit(0);
            
            // Since we can't execute arbitrary SQL through the client, 
            // let's create the tables manually using the specific methods
            console.log(`⚠️  Cannot execute raw SQL through client: ${statement.substring(0, 50)}...`);
            errorCount++;
          } catch (err) {
            console.log(`⚠️  Statement error: ${err.message}`);
            errorCount++;
          }
        }
      }
      
      console.log(`📊 ${migration}: ${successCount} successful, ${errorCount} errors`);
    }
    
    console.log('\n❌ Cannot apply migrations through JavaScript client');
    console.log('🔧 Please apply migrations manually through Supabase Dashboard SQL Editor');
    console.log('🌐 Visit: https://supabase.com/dashboard/project/vxtalnnjudbogemgmkoe/sql');
    
  } catch (error) {
    console.log(`❌ Migration failed: ${error.message}`);
  }
}

applyMigrations();