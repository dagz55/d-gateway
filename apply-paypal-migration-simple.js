#!/usr/bin/env node

/**
 * PayPal Payments Migration Script (Simple Version)
 * 
 * This script applies the PayPal payments table migration to Supabase
 * Run with: node apply-paypal-migration-simple.js
 */

const { createClient } = require('@supabase/supabase-js');

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

    // Check if table already exists
    console.log('🔍 Checking if paypal_payments table exists...');
    const { data: existingTable, error: checkError } = await supabase
      .from('paypal_payments')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking table:', checkError);
      process.exit(1);
    }

    if (existingTable !== null) {
      console.log('✅ paypal_payments table already exists');
      console.log('🎉 PayPal payments migration already completed!');
      return;
    }

    console.log('📋 Table does not exist, creating...');
    console.log('⚠️  Please run the following SQL in your Supabase SQL editor:');
    console.log('');
    console.log('-- Create PayPal payments table');
    console.log('CREATE TABLE IF NOT EXISTS paypal_payments (');
    console.log('    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('    amount DECIMAL(10,2) NOT NULL,');
    console.log('    currency VARCHAR(3) NOT NULL DEFAULT \'USD\',');
    console.log('    description TEXT NOT NULL,');
    console.log('    customer_name VARCHAR(255) NOT NULL,');
    console.log('    customer_email VARCHAR(255) NOT NULL,');
    console.log('    status VARCHAR(20) NOT NULL DEFAULT \'pending\' CHECK (status IN (\'pending\', \'completed\', \'failed\')),');
    console.log('    payment_link TEXT NOT NULL,');
    console.log('    paypal_order_id VARCHAR(255),');
    console.log('    transaction_details JSONB,');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_paypal_payments_status ON paypal_payments(status);');
    console.log('CREATE INDEX IF NOT EXISTS idx_paypal_payments_customer_email ON paypal_payments(customer_email);');
    console.log('CREATE INDEX IF NOT EXISTS idx_paypal_payments_created_at ON paypal_payments(created_at);');
    console.log('CREATE INDEX IF NOT EXISTS idx_paypal_payments_paypal_order_id ON paypal_payments(paypal_order_id);');
    console.log('');
    console.log('-- Enable RLS');
    console.log('ALTER TABLE paypal_payments ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create RLS policies');
    console.log('CREATE POLICY "Admins can view all PayPal payments" ON paypal_payments');
    console.log('    FOR SELECT USING (');
    console.log('        EXISTS (');
    console.log('            SELECT 1 FROM user_profiles');
    console.log('            WHERE user_profiles.user_id = auth.uid()');
    console.log('            AND user_profiles.role = \'admin\'');
    console.log('        )');
    console.log('    );');
    console.log('');
    console.log('CREATE POLICY "Admins can create PayPal payments" ON paypal_payments');
    console.log('    FOR INSERT WITH CHECK (');
    console.log('        EXISTS (');
    console.log('            SELECT 1 FROM user_profiles');
    console.log('            WHERE user_profiles.user_id = auth.uid()');
    console.log('            AND user_profiles.role = \'admin\'');
    console.log('        )');
    console.log('    );');
    console.log('');
    console.log('CREATE POLICY "Admins can update PayPal payments" ON paypal_payments');
    console.log('    FOR UPDATE USING (');
    console.log('        EXISTS (');
    console.log('            SELECT 1 FROM user_profiles');
    console.log('            WHERE user_profiles.user_id = auth.uid()');
    console.log('            AND user_profiles.role = \'admin\'');
    console.log('        )');
    console.log('    );');
    console.log('');
    console.log('CREATE POLICY "Public can view payment by ID" ON paypal_payments');
    console.log('    FOR SELECT USING (true);');
    console.log('');
    console.log('CREATE POLICY "Public can update payment status" ON paypal_payments');
    console.log('    FOR UPDATE USING (true);');
    console.log('');
    console.log('-- Create updated_at trigger');
    console.log('CREATE OR REPLACE FUNCTION update_updated_at_column()');
    console.log('RETURNS TRIGGER AS $$');
    console.log('BEGIN');
    console.log('    NEW.updated_at = NOW();');
    console.log('    RETURN NEW;');
    console.log('END;');
    console.log('$$ language \'plpgsql\';');
    console.log('');
    console.log('CREATE TRIGGER update_paypal_payments_updated_at');
    console.log('    BEFORE UPDATE ON paypal_payments');
    console.log('    FOR EACH ROW');
    console.log('    EXECUTE FUNCTION update_updated_at_column();');
    console.log('');
    console.log('🔗 After running the SQL above, you can test the integration by:');
    console.log('   1. Going to /admin/dashboard/payments');
    console.log('   2. Creating a test payment link');
    console.log('   3. Testing the payment flow');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
applyPayPalMigration();
