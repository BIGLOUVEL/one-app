import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // Mark onboarding as completed (upsert in case profile doesn't exist yet)
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })

    if (error) {
      console.error("Failed to mark onboarding complete:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
