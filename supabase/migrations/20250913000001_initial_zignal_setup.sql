-- =====================================================
-- ZIGNAL - Initial Database Setup Migration
-- Created: 2025-09-13
-- Description: Complete database schema for trading platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER PROFILES TABLE
-- Extends Supabase auth.users with trading-specific data
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    age INTEGER DEFAULT 25 CHECK (age >= 18 AND age <= 120),
    gender TEXT DEFAULT 'PREFER_NOT_TO_SAY' CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    trader_level TEXT DEFAULT 'BEGINNER' CHECK (trader_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    account_balance DECIMAL(20,8) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT false,
    package TEXT DEFAULT 'BASIC' CHECK (package IN ('BASIC', 'PREMIUM', 'VIP', 'ENTERPRISE')),
    status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'AWAY', 'BUSY')),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    password TEXT, -- For credential-based login
    phone TEXT,
    country TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    trading_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TRADING ACCOUNTS TABLE
-- Support for multiple trading accounts per user
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT DEFAULT 'DEMO' CHECK (account_type IN ('DEMO', 'LIVE', 'PAPER')),
    balance DECIMAL(20,8) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'USDT', 'BTC', 'ETH')),
    broker TEXT,
    api_key_encrypted TEXT, -- Encrypted API keys
    is_active BOOLEAN DEFAULT true,
    risk_management JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TRADING SIGNALS TABLE
-- AI-generated and manual trading signals
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trading_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_provider_id UUID REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
    pair TEXT NOT NULL, -- e.g., 'BTC/USDT'
    action TEXT CHECK (action IN ('BUY', 'SELL', 'HOLD')) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL CHECK (entry_price > 0),
    target_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 50,
    timeframe TEXT DEFAULT '1H' CHECK (timeframe IN ('1M', '5M', '15M', '1H', '4H', '1D', '1W')),
    signal_type TEXT DEFAULT 'MANUAL' CHECK (signal_type IN ('AI', 'MANUAL', 'COPY', 'SYSTEM')),
    status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'TRIGGERED', 'CANCELLED')) DEFAULT 'ACTIVE',
    analysis TEXT,
    tags TEXT[],
    risk_reward_ratio DECIMAL(5,2),
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TRADES TABLE
-- Record of executed trades
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    trading_account_id UUID REFERENCES public.trading_accounts(id) ON DELETE SET NULL,
    signal_id UUID REFERENCES public.trading_signals(id) ON DELETE SET NULL,
    pair TEXT NOT NULL,
    side TEXT CHECK (side IN ('BUY', 'SELL')) NOT NULL,
    order_type TEXT DEFAULT 'MARKET' CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT')),
    quantity DECIMAL(20,8) NOT NULL CHECK (quantity > 0),
    entry_price DECIMAL(20,8) NOT NULL CHECK (entry_price > 0),
    exit_price DECIMAL(20,8),
    pnl DECIMAL(20,8) DEFAULT 0,
    pnl_percentage DECIMAL(10,4) DEFAULT 0,
    fees DECIMAL(20,8) DEFAULT 0,
    status TEXT CHECK (status IN ('PENDING', 'OPEN', 'CLOSED', 'CANCELLED')) DEFAULT 'PENDING',
    trade_type TEXT DEFAULT 'SPOT' CHECK (trade_type IN ('SPOT', 'MARGIN', 'FUTURES')),
    leverage INTEGER DEFAULT 1,
    notes TEXT,
    opened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PORTFOLIO HOLDINGS TABLE
-- Track user's crypto holdings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    trading_account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL, -- e.g., 'BTC', 'ETH'
    quantity DECIMAL(20,8) NOT NULL DEFAULT 0,
    average_cost DECIMAL(20,8) DEFAULT 0,
    current_price DECIMAL(20,8) DEFAULT 0,
    total_value DECIMAL(20,8) DEFAULT 0,
    unrealized_pnl DECIMAL(20,8) DEFAULT 0,
    allocation_percentage DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, trading_account_id, symbol)
);

-- =====================================================
-- WATCHLIST TABLE
-- User's favorite trading pairs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    symbol TEXT NOT NULL, -- e.g., 'BTC/USDT'
    list_name TEXT DEFAULT 'Default',
    notes TEXT,
    price_alerts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, symbol, list_name)
);

-- =====================================================
-- CRYPTO PRICES TABLE
-- Real-time cryptocurrency market data
-- =====================================================
CREATE TABLE IF NOT EXISTS public.crypto_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL, -- e.g., 'BTC', 'ETH'
    name TEXT NOT NULL, -- e.g., 'Bitcoin', 'Ethereum'
    price_usd DECIMAL(20,8) NOT NULL CHECK (price_usd >= 0),
    change_24h DECIMAL(10,4) NOT NULL,
    change_7d DECIMAL(10,4) DEFAULT 0,
    volume_24h DECIMAL(30,8) NOT NULL CHECK (volume_24h >= 0),
    market_cap DECIMAL(30,8),
    circulating_supply DECIMAL(30,8),
    total_supply DECIMAL(30,8),
    rank INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- NEWS ARTICLES TABLE
-- Cryptocurrency and trading news
-- =====================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    author TEXT,
    source TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'bitcoin', 'ethereum', 'defi', 'nft', 'regulation')),
    sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    tags TEXT[],
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- System notifications and alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'trade', 'signal')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TRANSACTIONS TABLE
-- Financial transactions (deposits, withdrawals)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    trading_account_id UUID REFERENCES public.trading_accounts(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'REBATE')) NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    currency TEXT CHECK (currency IN ('USD', 'USDT', 'BTC', 'ETH', 'PHP')) NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING',
    method TEXT, -- e.g., 'bank_transfer', 'crypto', 'paypal'
    external_id TEXT, -- External transaction reference
    destination_address TEXT,
    transaction_hash TEXT,
    fees DECIMAL(20,8) DEFAULT 0,
    notes TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- COPY TRADING TABLE
-- Social trading relationships
-- =====================================================
CREATE TABLE IF NOT EXISTS public.copy_trading (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    trader_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    allocation_amount DECIMAL(20,8) DEFAULT 0,
    copy_percentage DECIMAL(5,2) DEFAULT 100 CHECK (copy_percentage > 0 AND copy_percentage <= 100),
    risk_management JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    total_copied_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(follower_id, trader_id)
);

-- =====================================================
-- PERFORMANCE ANALYTICS TABLE
-- Trading performance statistics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.performance_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    total_volume DECIMAL(30,8) DEFAULT 0,
    sharpe_ratio DECIMAL(10,4) DEFAULT 0,
    max_drawdown DECIMAL(10,4) DEFAULT 0,
    roi DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, period, period_start)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_package ON public.user_profiles(package);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Trading accounts indexes
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_active ON public.trading_accounts(is_active);

-- Trading signals indexes
CREATE INDEX IF NOT EXISTS idx_trading_signals_provider ON public.trading_signals(signal_provider_id);
CREATE INDEX IF NOT EXISTS idx_trading_signals_pair ON public.trading_signals(pair);
CREATE INDEX IF NOT EXISTS idx_trading_signals_status ON public.trading_signals(status);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON public.trading_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_type ON public.trading_signals(signal_type);

-- Trades indexes
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON public.trades(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON public.trades(pair);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON public.trades(opened_at DESC);

-- Portfolio holdings indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_account_id ON public.portfolio_holdings(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON public.portfolio_holdings(symbol);

-- Watchlist indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON public.watchlist(symbol);

-- Crypto prices indexes
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_updated ON public.crypto_prices(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_rank ON public.crypto_prices(rank);

-- News articles indexes
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_source ON public.news_articles(source);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Copy trading indexes
CREATE INDEX IF NOT EXISTS idx_copy_trading_follower ON public.copy_trading(follower_id);
CREATE INDEX IF NOT EXISTS idx_copy_trading_trader ON public.copy_trading(trader_id);
CREATE INDEX IF NOT EXISTS idx_copy_trading_active ON public.copy_trading(is_active);

-- Performance analytics indexes
CREATE INDEX IF NOT EXISTS idx_performance_user_id ON public.performance_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_period ON public.performance_analytics(period);
CREATE INDEX IF NOT EXISTS idx_performance_start ON public.performance_analytics(period_start DESC);