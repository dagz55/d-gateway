-- =====================================================
-- ZIGNAL - Fix Missing RLS Policies (Corrected)
-- Created: 2025-09-19
-- Description: Adds and corrects RLS policies for all relevant tables.
-- This version standardizes user identification and simplifies admin checks.
-- =====================================================

-- First, ensure all relevant tables have RLS enabled.
-- This is idempotent and safe to run multiple times.
ALTER TABLE public.copy_trading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper Function for Admin Check
-- =====================================================
-- This function simplifies admin checks across policies.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id::text = auth.uid()::text AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;


CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- A separate, more permissive SELECT policy for public viewing is often needed.
CREATE POLICY "Authenticated users can view public profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (is_admin());

-- =====================================================
-- USER_DATA TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own user data" ON public.user_data;
DROP POLICY IF EXISTS "Admins can manage all user data" ON public.user_data;

CREATE POLICY "Users can manage own user data" ON public.user_data
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user data" ON public.user_data
    FOR ALL USING (is_admin());

-- =====================================================
-- COPY TRADING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Followers can manage their subscription" ON public.copy_trading;
DROP POLICY IF EXISTS "Traders can view their followers" ON public.copy_trading;
DROP POLICY IF EXISTS "Admins can manage copy trading" ON public.copy_trading;

CREATE POLICY "Followers can manage their subscription" ON public.copy_trading
    FOR ALL USING (follower_id = auth.uid());

CREATE POLICY "Traders can view their followers" ON public.copy_trading
    FOR SELECT USING (trader_id = auth.uid());

CREATE POLICY "Admins can manage copy trading" ON public.copy_trading
    FOR ALL USING (is_admin());

-- =====================================================
-- CRYPTO PRICES & NEWS ARTICLES (Public Data)
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can read prices" ON public.crypto_prices;
DROP POLICY IF EXISTS "Admins and service roles can manage prices" ON public.crypto_prices;
CREATE POLICY "Authenticated users can read prices" ON public.crypto_prices
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and service roles can manage prices" ON public.crypto_prices
    FOR ALL USING (auth.role() = 'service_role' OR is_admin());

DROP POLICY IF EXISTS "Authenticated users can read news" ON public.news_articles;
DROP POLICY IF EXISTS "Admins and service roles can manage news" ON public.news_articles;
CREATE POLICY "Authenticated users can read news" ON public.news_articles
    FOR SELECT USING (auth.role() = 'authenticated' AND (published = true OR published IS NULL));
CREATE POLICY "Admins and service roles can manage news" ON public.news_articles
    FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (is_admin());

-- =====================================================
-- PERFORMANCE ANALYTICS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own performance" ON public.performance_analytics;
DROP POLICY IF EXISTS "Admins can manage performance analytics" ON public.performance_analytics;
DROP POLICY IF EXISTS "Followers can view trader performance" ON public.performance_analytics;

CREATE POLICY "Users can view own performance" ON public.performance_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Followers can view trader performance" ON public.performance_analytics
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.copy_trading ct
        WHERE ct.trader_id = performance_analytics.user_id
          AND ct.follower_id = auth.uid()
          AND ct.is_active = true
    ));

CREATE POLICY "Admins can manage performance analytics" ON public.performance_analytics
    FOR ALL USING (is_admin());

-- =====================================================
-- PORTFOLIO HOLDINGS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Admins can manage all portfolios" ON public.portfolio_holdings;

CREATE POLICY "Users can manage own portfolio" ON public.portfolio_holdings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all portfolios" ON public.portfolio_holdings
    FOR ALL USING (is_admin());

-- =====================================================
-- TRADES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own trades" ON public.trades;
DROP POLICY IF EXISTS "Admins can manage all trades" ON public.trades;

CREATE POLICY "Users can manage own trades" ON public.trades
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all trades" ON public.trades
    FOR ALL USING (is_admin());

-- =====================================================
-- TRADING ACCOUNTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own trading accounts" ON public.trading_accounts;
DROP POLICY IF EXISTS "Admins can manage all trading accounts" ON public.trading_accounts;

CREATE POLICY "Users can manage own trading accounts" ON public.trading_accounts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all trading accounts" ON public.trading_accounts
    FOR ALL USING (is_admin());

-- =====================================================
-- TRADING SIGNALS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view active signals" ON public.trading_signals;
DROP POLICY IF EXISTS "Providers can manage own signals" ON public.trading_signals;
DROP POLICY IF EXISTS "Admins can manage all signals" ON public.trading_signals;

CREATE POLICY "Users can view active signals" ON public.trading_signals
    FOR SELECT USING (status = 'active' AND is_published = true);

CREATE POLICY "Providers can manage own signals" ON public.trading_signals
    FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Admins can manage all signals" ON public.trading_signals
    FOR ALL USING (is_admin());

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;

CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (user_id = auth.uid() OR from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (is_admin());

-- =====================================================
-- WATCHLIST POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Admins can manage all watchlists" ON public.watchlist;

CREATE POLICY "Users can manage own watchlist" ON public.watchlist
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all watchlists" ON public.watchlist
    FOR ALL USING (is_admin());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant permissions to the 'authenticated' role. RLS policies will enforce access.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_trading TO authenticated;
GRANT SELECT ON public.crypto_prices TO authenticated;
GRANT SELECT ON public.news_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.performance_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_holdings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_signals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist TO authenticated;

-- The 'service_role' bypasses RLS, so it has full access implicitly.
-- However, explicit grants are good practice for clarity.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
COMMENT ON SCHEMA public IS 'RLS policies corrected and standardized on 2025-09-19.';