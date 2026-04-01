export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      // Duplicate email — not an error for the user
      if (error.code === "23505") {
        return NextResponse.json({ success: true })
      }
      console.error("[waitlist] supabase error:", error)
      return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[waitlist] error:", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("waitlist")
    .select("email, created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ count: data.length, emails: data })
}
