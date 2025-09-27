-- =====================================================
-- ZIGNAL - Fix Immediate UUID/TEXT Issues
-- Created: 2025-09-25
-- Description: Quick fix for UUID/TEXT comparison issues in RLS policies
-- Migration: 20250925000006_fix_immediate_uuid_text_issues.sql
-- =====================================================

-- Drop and recreate problematic policies with proper type casting

-- =====================================================
-- USER PROFILES POLICIES (IMMEDIATE FIX)
-- =====================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Recreate with proper type casting
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- OTHER TABLES WITH SIMILAR ISSUES
-- =====================================================

-- Fix trading_accounts policies
DROP POLICY IF EXISTS "Users can view own accounts" ON public.trading_accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.trading_accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.trading_accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.trading_accounts;

CREATE POLICY "Users can view own accounts" ON public.trading_accounts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own accounts" ON public.trading_accounts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own accounts" ON public.trading_accounts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own accounts" ON public.trading_accounts
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fix trades policies
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;

CREATE POLICY "Users can view own trades" ON public.trades
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own trades" ON public.trades
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own trades" ON public.trades
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fix portfolio_holdings policies
DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.portfolio_holdings;

CREATE POLICY "Users can view own portfolio" ON public.portfolio_holdings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own portfolio" ON public.portfolio_holdings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own portfolio" ON public.portfolio_holdings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own portfolio" ON public.portfolio_holdings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fix transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

COMMENT ON SCHEMA public IS 'UUID/TEXT casting issues fixed for RLS policies - 2025-09-25';