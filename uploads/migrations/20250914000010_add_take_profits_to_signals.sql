-- Add take_profits array column to public.signals for TP levels
ALTER TABLE public.signals
ADD COLUMN IF NOT EXISTS take_profits DECIMAL(20,8)[];

-- Optional: set default to empty array for convenience
ALTER TABLE public.signals
ALTER COLUMN take_profits SET DEFAULT ARRAY[]::DECIMAL(20,8)[];

-- Basic index to support existence checks (GIN not directly useful on numeric[] here)
-- You can extend with specialized indexes if you query by specific TP values.
