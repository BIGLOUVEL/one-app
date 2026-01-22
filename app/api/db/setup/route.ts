import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' },
    auth: { persistSession: false }
  })

  try {
    // First, let's just try to create a simple table
    // We'll use upsert to test if the table exists

    // Try to select from app_state to see if it exists
    const { error: selectError } = await supabase
      .from('app_state')
      .select('id')
      .limit(1)

    if (selectError && selectError.code === '42P01') {
      // Table doesn't exist - need to create via SQL Editor in Supabase Dashboard
      return NextResponse.json({
        success: false,
        message: "Table 'app_state' does not exist. Please create it in Supabase Dashboard.",
        sql: `
CREATE TABLE app_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (MVP - no auth yet)
CREATE POLICY "Allow all" ON app_state FOR ALL USING (true);
        `
      })
    }

    if (selectError) {
      return NextResponse.json({
        success: false,
        error: selectError.message,
        code: selectError.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Table 'app_state' exists and is ready!"
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to check/setup the database",
    sql_to_run_in_supabase: `
CREATE TABLE IF NOT EXISTS app_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (MVP - no auth yet)
CREATE POLICY "Allow all" ON app_state FOR ALL USING (true);
    `
  })
}
