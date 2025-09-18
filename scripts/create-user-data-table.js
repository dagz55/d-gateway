#!/usr/bin/env node

/**
 * Script to create a simple user_data table for storing WorkOS user information
 * Run with: node scripts/create-user-data-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserDataTable() {
  console.log('🚀 Creating user_data table for WorkOS users...');
  
  try {
    // Create a simple table to store user data
    // We'll use raw SQL execution through the admin client
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.user_data (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        workos_user_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT,
        profile_picture_url TEXT,
        is_admin BOOLEAN DEFAULT false,
        package TEXT DEFAULT 'PREMIUM',
        trader_level TEXT DEFAULT 'BEGINNER',
        status TEXT DEFAULT 'ONLINE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_data_workos_user_id ON public.user_data(workos_user_id);
      CREATE INDEX IF NOT EXISTS idx_user_data_email ON public.user_data(email);
      CREATE INDEX IF NOT EXISTS idx_user_data_is_admin ON public.user_data(is_admin);
      
      ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Allow all operations on user_data" ON public.user_data
        FOR ALL USING (true) WITH CHECK (true);
    `;

    // Since we can't execute raw SQL directly, let's try to create a record to test the table
    console.log('📝 Testing table creation by inserting a test record...');
    
    const testData = {
      workos_user_id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      is_admin: false,
      package: 'PREMIUM',
      trader_level: 'BEGINNER',
      status: 'ONLINE'
    };

    const { data, error } = await supabase
      .from('user_data')
      .insert(testData)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        console.log('❌ Table user_data does not exist.');
        console.log('📋 Please create the table manually in your Supabase dashboard:');
        console.log('');
        console.log('Run this SQL in your Supabase SQL Editor:');
        console.log(createTableQuery);
        console.log('');
        console.log('Or use the Supabase CLI:');
        console.log('npx supabase db push');
      } else {
        console.error('❌ Error:', error);
      }
    } else {
      console.log('✅ Table user_data exists and is working!');
      console.log('✅ Test record created:', data);
      
      // Clean up test record
      await supabase.from('user_data').delete().eq('id', data.id);
      console.log('🧹 Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the setup
createUserDataTable();
