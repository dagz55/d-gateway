-- Create a table for WorkOS users without foreign key constraints
CREATE TABLE IF NOT EXISTS public.workos_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workos_user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    package TEXT DEFAULT 'PREMIUM' CHECK (package IN ('BASIC', 'PREMIUM', 'VIP')),
    trader_level TEXT DEFAULT 'BEGINNER' CHECK (trader_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    status TEXT DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'AWAY')),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    trading_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workos_users_workos_user_id ON public.workos_users(workos_user_id);
CREATE INDEX IF NOT EXISTS idx_workos_users_email ON public.workos_users(email);
CREATE INDEX IF NOT EXISTS idx_workos_users_is_admin ON public.workos_users(is_admin);

-- Enable RLS
ALTER TABLE public.workos_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now since we're using WorkOS for auth
CREATE POLICY "Allow all operations on workos_users" ON public.workos_users
    FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_workos_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on workos_users
DROP TRIGGER IF EXISTS update_workos_users_updated_at ON public.workos_users;
CREATE TRIGGER update_workos_users_updated_at
    BEFORE UPDATE ON public.workos_users
    FOR EACH ROW EXECUTE FUNCTION public.update_workos_users_updated_at_column();
