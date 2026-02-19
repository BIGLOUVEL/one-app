// Temporary script to create profiles table in Supabase
// Run with: node scripts/setup-profiles.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ydvtxjgjockwpcdvqsow.supabase.co"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var first")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

// Test if profiles table exists
const { error } = await supabase.from("profiles").select("id").limit(1)

if (error && error.code === "42P01") {
  console.log("❌ Table 'profiles' does not exist.")
  console.log("\n📋 Copy-paste this SQL into Supabase Dashboard > SQL Editor > New Query:\n")
  console.log(`
-- ==========================================
-- PROFILES TABLE + Google Calendar columns
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'none')),
  promo_used BOOLEAN DEFAULT false,
  current_period_end TIMESTAMPTZ,
  google_calendar_access_token TEXT,
  google_calendar_refresh_token TEXT,
  google_calendar_token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role has full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Backfill existing users
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
  `)
} else if (error) {
  console.log("Error:", error.message, error.code)
} else {
  console.log("✅ Table 'profiles' already exists!")

  // Check for existing users
  const { data: profiles, error: listErr } = await supabase.from("profiles").select("*")
  if (profiles) {
    console.log(`Found ${profiles.length} profiles:`)
    profiles.forEach(p => {
      console.log(`  - ${p.email} | status: ${p.subscription_status} | stripe: ${p.stripe_customer_id || 'none'}`)
    })
  }
}
