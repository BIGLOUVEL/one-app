import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current token to revoke it
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("google_calendar_access_token")
      .eq("id", user.id)
      .single()

    if (profile?.google_calendar_access_token) {
      // Best-effort revocation with Google
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${profile.google_calendar_access_token}`,
        { method: "POST" }
      ).catch(() => {})
    }

    // Clear tokens from database
    await supabaseAdmin
      .from("profiles")
      .update({
        google_calendar_access_token: null,
        google_calendar_refresh_token: null,
        google_calendar_token_expiry: null,
      })
      .eq("id", user.id)

    return NextResponse.json({ disconnected: true })
  } catch (error: any) {
    console.error("Google Calendar disconnect error:", error)
    return NextResponse.json(
      { error: `Disconnect failed: ${error?.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}
