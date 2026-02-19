export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

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
      .select("subscription_status, current_period_end, promo_used, stripe_subscription_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({
        status: "none",
        active: false,
        currentPeriodEnd: null,
        promoUsed: false,
        priceAmount: null,
        priceCurrency: null,
      })
    }

    // Check if subscription is still valid (even if canceled, access until period end)
    const isActive = profile.subscription_status === "active" ||
      (profile.subscription_status === "canceled" &&
       profile.current_period_end &&
       new Date(profile.current_period_end) > new Date())

    // Fetch actual price from Stripe subscription
    let priceAmount: number | null = null
    let priceCurrency: string | null = null
    if (profile.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
        const item = sub.items.data[0]
        if (item?.price) {
          priceAmount = item.price.unit_amount // in cents
          priceCurrency = item.price.currency   // e.g. "eur", "usd"
        }
      } catch {
        // Subscription may have been deleted in Stripe — ignore
      }
    }

    return NextResponse.json({
      status: profile.subscription_status || "none",
      active: isActive,
      currentPeriodEnd: profile.current_period_end,
      promoUsed: profile.promo_used || false,
      priceAmount,
      priceCurrency,
    })
  } catch (error) {
    console.error("Status error:", error)
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    )
  }
}
