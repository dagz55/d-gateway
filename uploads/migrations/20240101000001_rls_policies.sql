-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Trades policies
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own trades" ON public.trades
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Signals policies
CREATE POLICY "Users can view their own signals" ON public.signals
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own signals" ON public.signals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own signals" ON public.signals
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Crypto prices policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view crypto prices" ON public.crypto_prices
    FOR SELECT USING (auth.role() = 'authenticated');

-- News policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view news" ON public.news
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role policies for admin operations
CREATE POLICY "Service role can manage crypto prices" ON public.crypto_prices
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage news" ON public.news
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');