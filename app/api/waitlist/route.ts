export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { error } = await supabaseAdmin
      .from("waitlist")
      .insert({ email: normalizedEmail })

    if (error) {
      // Duplicate email — still return success (don't reveal if already signed up)
      if (error.code === "23505") {
        return NextResponse.json({ success: true })
      }
      console.error("[waitlist] insert error:", error)
      return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[waitlist] unexpected error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
