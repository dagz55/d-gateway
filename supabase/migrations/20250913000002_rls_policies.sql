-- =====================================================
-- ZIGNAL - Row Level Security Policies
-- Created: 2025-09-13
-- Description: Security policies for all tables
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_trading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Public profile viewing for copy trading (limited fields)
CREATE POLICY "Public profile view for copy trading" ON public.user_profiles
    FOR SELECT USING (true);

-- =====================================================
-- TRADING ACCOUNTS POLICIES
-- =====================================================

-- Users can manage their own trading accounts
CREATE POLICY "Users can manage own trading accounts" ON public.trading_accounts
    FOR ALL USING (auth.uid()::uuid = user_id);

-- =====================================================
-- TRADING SIGNALS POLICIES
-- =====================================================

-- Users can view all active signals
CREATE POLICY "Users can view active signals" ON public.trading_signals
    FOR SELECT USING (status = 'ACTIVE');

-- Signal providers can manage their own signals
CREATE POLICY "Providers can manage own signals" ON public.trading_signals
    FOR ALL USING (auth.uid() = signal_provider_id);

-- =====================================================
-- TRADES POLICIES
-- =====================================================

-- Users can manage their own trades
CREATE POLICY "Users can manage own trades" ON public.trades
    FOR ALL USING (auth.uid()::uuid = user_id);

-- Copy trading followers can view trader's trades (with restrictions)
CREATE POLICY "Copy trading view access" ON public.trades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.copy_trading ct
            WHERE ct.trader_id = trades.user_id
            AND ct.follower_id = auth.uid()
            AND ct.is_active = true
        )
    );

-- =====================================================
-- PORTFOLIO HOLDINGS POLICIES
-- =====================================================

-- Users can manage their own portfolio
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_holdings
    FOR ALL USING (auth.uid()::uuid = user_id);

-- =====================================================
-- WATCHLIST POLICIES
-- =====================================================

-- Users can manage their own watchlist
CREATE POLICY "Users can manage own watchlist" ON public.watchlist
    FOR ALL USING (auth.uid()::uuid = user_id);

-- =====================================================
-- CRYPTO PRICES POLICIES
-- =====================================================

-- All authenticated users can read crypto prices
CREATE POLICY "Authenticated users can read prices" ON public.crypto_prices
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can update prices
CREATE POLICY "Service role can update prices" ON public.crypto_prices
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- NEWS ARTICLES POLICIES
-- =====================================================

-- All authenticated users can read news
CREATE POLICY "Authenticated users can read news" ON public.news_articles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can manage news
CREATE POLICY "Service role can manage news" ON public.news_articles
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid()::uuid = user_id);

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================

-- Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (auth.uid()::uuid = user_id);

-- =====================================================
-- COPY TRADING POLICIES
-- =====================================================

-- Users can manage their copy trading as follower
CREATE POLICY "Users can manage as follower" ON public.copy_trading
    FOR ALL USING (auth.uid() = follower_id);

-- Users can view copy trading relationships where they are the trader
CREATE POLICY "Users can view as trader" ON public.copy_trading
    FOR SELECT USING (auth.uid() = trader_id);

-- =====================================================
-- PERFORMANCE ANALYTICS POLICIES
-- =====================================================

-- Users can view their own performance
CREATE POLICY "Users can view own performance" ON public.performance_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/update performance data
CREATE POLICY "Service role can manage performance" ON public.performance_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Copy trading followers can view trader's performance
CREATE POLICY "Copy trading performance view" ON public.performance_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.copy_trading ct
            WHERE ct.trader_id = performance_analytics.user_id
            AND ct.follower_id = auth.uid()
            AND ct.is_active = true
        )
    );