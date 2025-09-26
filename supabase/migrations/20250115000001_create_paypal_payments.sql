-- Create PayPal payments table
CREATE TABLE IF NOT EXISTS paypal_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_link TEXT NOT NULL,
    paypal_order_id VARCHAR(255),
    transaction_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_paypal_payments_status ON paypal_payments(status);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_customer_email ON paypal_payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_created_at ON paypal_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_paypal_order_id ON paypal_payments(paypal_order_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paypal_payments_updated_at 
    BEFORE UPDATE ON paypal_payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE paypal_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow admins to view all payments
CREATE POLICY "Admins can view all PayPal payments" ON paypal_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id::text = auth.uid()::text 
            AND user_profiles.role = 'admin'
        )
    );

-- Allow admins to insert payments
CREATE POLICY "Admins can create PayPal payments" ON paypal_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id::text = auth.uid()::text 
            AND user_profiles.role = 'admin'
        )
    );

-- Allow admins to update payments
CREATE POLICY "Admins can update PayPal payments" ON paypal_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id::text = auth.uid()::text 
            AND user_profiles.role = 'admin'
        )
    );

-- Allow public access to view payment by ID (for payment page)
CREATE POLICY "Public can view payment by ID" ON paypal_payments
    FOR SELECT USING (true);

-- Allow public access to update payment status (for PayPal webhooks)
CREATE POLICY "Public can update payment status" ON paypal_payments
    FOR UPDATE USING (true);

-- Add comments
COMMENT ON TABLE paypal_payments IS 'Stores PayPal payment requests and their status';
COMMENT ON COLUMN paypal_payments.id IS 'Unique payment identifier';
COMMENT ON COLUMN paypal_payments.amount IS 'Payment amount';
COMMENT ON COLUMN paypal_payments.currency IS 'Payment currency (USD, EUR, etc.)';
COMMENT ON COLUMN paypal_payments.description IS 'Payment description';
COMMENT ON COLUMN paypal_payments.customer_name IS 'Customer name';
COMMENT ON COLUMN paypal_payments.customer_email IS 'Customer email';
COMMENT ON COLUMN paypal_payments.status IS 'Payment status: pending, completed, failed';
COMMENT ON COLUMN paypal_payments.payment_link IS 'Generated payment link';
COMMENT ON COLUMN paypal_payments.paypal_order_id IS 'PayPal order ID after payment';
COMMENT ON COLUMN paypal_payments.transaction_details IS 'Full PayPal transaction details';
COMMENT ON COLUMN paypal_payments.created_at IS 'Payment creation timestamp';
COMMENT ON COLUMN paypal_payments.updated_at IS 'Last update timestamp';
