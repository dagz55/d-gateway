-- =====================================================
-- Create Packages Tables for Zignal Platform
-- Created: 2025-01-28
-- Description: Creates packages and user_packages tables for subscription management
-- =====================================================

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PACKAGES TABLE
-- Stores subscription packages available on the platform
-- =====================================================
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    features TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- USER_PACKAGES TABLE
-- Tracks user subscriptions to packages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one active subscription per user per package
    UNIQUE(user_id, package_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Packages table indexes
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(active);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_packages_price ON public.packages(price);

-- User packages table indexes
CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON public.user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_package_id ON public.user_packages(package_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_status ON public.user_packages(status);
CREATE INDEX IF NOT EXISTS idx_user_packages_end_date ON public.user_packages(end_date);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_status ON public.user_packages(user_id, status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR PACKAGES TABLE
-- =====================================================

-- Anyone can view active packages
CREATE POLICY "Anyone can view active packages" ON public.packages
    FOR SELECT USING (active = true);

-- Only authenticated users can view all packages (for admin purposes)
CREATE POLICY "Authenticated users can view all packages" ON public.packages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete packages
CREATE POLICY "Only admins can manage packages" ON public.packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- =====================================================
-- RLS POLICIES FOR USER_PACKAGES TABLE
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_packages
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (when purchasing)
CREATE POLICY "Users can create own subscriptions" ON public.user_packages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions (for auto-renew settings)
CREATE POLICY "Users can update own subscriptions" ON public.user_packages
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.user_packages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.user_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for packages table
CREATE TRIGGER update_packages_updated_at 
    BEFORE UPDATE ON public.packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_packages table
CREATE TRIGGER update_user_packages_updated_at 
    BEFORE UPDATE ON public.user_packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert some sample packages
INSERT INTO public.packages (name, description, price, duration_days, features, active) VALUES
(
    'Basic Trading Signals',
    'Get started with basic cryptocurrency trading signals and market insights.',
    29.99,
    30,
    ARRAY['Daily trading signals', 'Basic market analysis', 'Email notifications', 'Community access'],
    true
),
(
    'Premium Trading Signals',
    'Advanced trading signals with detailed analysis and risk management.',
    99.99,
    30,
    ARRAY['Premium trading signals', 'Advanced market analysis', 'Risk management tools', 'Priority support', 'Real-time alerts', 'Portfolio tracking'],
    true
),
(
    'VIP Trading Signals',
    'Exclusive VIP signals with personal trading coach and advanced features.',
    299.99,
    30,
    ARRAY['VIP trading signals', 'Personal trading coach', 'Advanced analytics', 'Custom strategies', '24/7 support', 'Exclusive webinars', 'Portfolio optimization'],
    true
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.packages IS 'Subscription packages available on the Zignal platform';
COMMENT ON TABLE public.user_packages IS 'User subscriptions to packages with status tracking';
