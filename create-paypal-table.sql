-- =====================================================
-- PayPal Payments Table Creation
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PAYPAL_PAYMENTS TABLE
-- Stores PayPal payment link data and transaction details
-- =====================================================
CREATE TABLE IF NOT EXISTS public.paypal_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    description TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_link TEXT NOT NULL,
    paypal_order_id TEXT,
    paypal_transaction_id TEXT,
    payment_method TEXT,
    fees DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    expiry_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_paypal_payments_status ON public.paypal_payments(status);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_customer_email ON public.paypal_payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_created_at ON public.paypal_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_paypal_order_id ON public.paypal_payments(paypal_order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE public.paypal_payments ENABLE ROW LEVEL SECURITY;

-- Allow public access to payment links (for customers to pay)
CREATE POLICY "Public can view payment links" ON public.paypal_payments
    FOR SELECT USING (true);

-- Allow authenticated users to create payment links
CREATE POLICY "Authenticated users can create payments" ON public.paypal_payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to update payment status
CREATE POLICY "Admins can update payments" ON public.paypal_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'isAdmin' = 'true')
        )
    );

-- Allow admins to view all payments
CREATE POLICY "Admins can view all payments" ON public.paypal_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'isAdmin' = 'true')
        )
    );

-- =====================================================
-- UPDATE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paypal_payments_updated_at 
    BEFORE UPDATE ON public.paypal_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

