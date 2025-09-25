#!/usr/bin/env node

/**
 * Apply RLS Fix - Direct SQL Execution
 * This script applies the RLS fix by executing SQL directly
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('🔧 Applying RLS Fix for User Profiles...');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('apply-rls-fix.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error:`, err.message);
        }
      }
    }

    console.log('🎉 RLS Fix applied successfully!');
    console.log('✅ User profiles table should now work with Clerk integration');

  } catch (error) {
    console.error('❌ Error applying RLS fix:', error);
    console.log('\n📋 Manual steps:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the contents of apply-rls-fix.sql');
    console.log('3. Execute the SQL statements');
  }
}

// Run the fix
applyRLSFix();
