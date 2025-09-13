-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pair TEXT NOT NULL,
    side TEXT CHECK (side IN ('BUY', 'SELL')) NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    price DECIMAL(20,8) NOT NULL CHECK (price > 0),
    pnl DECIMAL(20,8),
    status TEXT CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN' NOT NULL,
    time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create signals table
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pair TEXT NOT NULL,
    action TEXT CHECK (action IN ('BUY', 'SELL', 'HOLD')) NOT NULL,
    target_price DECIMAL(20,8) NOT NULL CHECK (target_price > 0),
    stop_loss DECIMAL(20,8),
    status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'TRIGGERED')) DEFAULT 'ACTIVE' NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 50,
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('DEPOSIT', 'WITHDRAWAL')) NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    currency TEXT CHECK (currency IN ('USD', 'USDT', 'PHP')) NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING' NOT NULL,
    method TEXT,
    destination TEXT,
    reference TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create crypto_prices table
CREATE TABLE IF NOT EXISTS public.crypto_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    price DECIMAL(20,8) NOT NULL CHECK (price > 0),
    change_24h DECIMAL(10,4) NOT NULL,
    volume_24h DECIMAL(30,8) NOT NULL CHECK (volume_24h >= 0),
    market_cap DECIMAL(30,8),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    source TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON public.trades(pair);

CREATE INDEX IF NOT EXISTS idx_signals_user_id ON public.signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_updated_at ON public.crypto_prices(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON public.news(source);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();