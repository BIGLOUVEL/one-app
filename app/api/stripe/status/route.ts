export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_status, current_period_end, promo_used")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({
        status: "none",
        active: false,
        currentPeriodEnd: null,
        promoUsed: false,
      })
    }

    // Check if subscription is still valid (even if canceled, access until period end)
    const isActive = profile.subscription_status === "active" ||
      (profile.subscription_status === "canceled" &&
       profile.current_period_end &&
       new Date(profile.current_period_end) > new Date())

    return NextResponse.json({
      status: profile.subscription_status || "none",
      active: isActive,
      currentPeriodEnd: profile.current_period_end,
      promoUsed: profile.promo_used || false,
    })
  } catch (error) {
    console.error("Status error:", error)
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    )
  }
}
