#!/usr/bin/env node

/**
 * PayPal Payments Migration Script
 * 
 * This script applies the PayPal payments table migration to Supabase
 * Run with: node apply-paypal-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPayPalMigration() {
  try {
    console.log('🚀 Starting PayPal payments migration...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250115000001_create_paypal_payments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');

    // Apply the migration
    console.log('🔄 Applying migration to Supabase...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ PayPal payments migration applied successfully!');

    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'paypal_payments');

    if (tableError) {
      console.error('❌ Error verifying table:', tableError);
      process.exit(1);
    }

    if (tables && tables.length > 0) {
      console.log('✅ paypal_payments table created successfully');
    } else {
      console.error('❌ paypal_payments table not found');
      process.exit(1);
    }

    // Test inserting a sample record
    console.log('🧪 Testing table functionality...');
    const testPayment = {
      id: 'test-payment-' + Date.now(),
      amount: 10.00,
      currency: 'USD',
      description: 'Test payment',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      status: 'pending',
      payment_link: 'https://example.com/pay/test',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('paypal_payments')
      .insert(testPayment)
      .select();

    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
      process.exit(1);
    }

    console.log('✅ Test payment inserted successfully');

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('paypal_payments')
      .delete()
      .eq('id', testPayment.id);

    if (deleteError) {
      console.warn('⚠️  Warning: Could not clean up test data:', deleteError);
    } else {
      console.log('🧹 Test data cleaned up');
    }

    console.log('\n🎉 PayPal payments migration completed successfully!');
    console.log('\n📋 What was created:');
    console.log('   ✅ paypal_payments table');
    console.log('   ✅ Indexes for performance');
    console.log('   ✅ RLS policies for security');
    console.log('   ✅ Updated_at trigger');
    console.log('\n🔗 Next steps:');
    console.log('   1. Set up PayPal API credentials in environment variables');
    console.log('   2. Test the payment link generation');
    console.log('   3. Access admin panel at /admin/dashboard/payments');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
applyPayPalMigration();
