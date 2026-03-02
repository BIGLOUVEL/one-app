-- Create waitlist table for pre-launch email collection
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (public inserts allowed via service role only)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- No public SELECT policy — only service role can read
