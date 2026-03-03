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
      .select("subscription_status, current_period_end, promo_used, stripe_subscription_id, stripe_customer_id")
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

    let status = profile.subscription_status
    let currentPeriodEnd = profile.current_period_end
    let priceAmount: number | null = null
    let priceCurrency: string | null = null

    // If DB status is unclear but we have a Stripe subscription, fetch from Stripe
    // to self-heal — this ensures any paid user always gets access
    if (profile.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id) as any
        const item = sub.items.data[0]
        if (item?.price) {
          priceAmount = item.price.unit_amount
          priceCurrency = item.price.currency
        }

        // Always trust Stripe as source of truth if DB status looks wrong
        const stripeStatus = sub.status // "active" | "trialing" | "canceled" | etc.
        const stripePeriodEnd = new Date(sub.current_period_end * 1000).toISOString()

        if (!status || status === "none" || status !== stripeStatus) {
          // DB is out of sync — repair it
          status = stripeStatus
          currentPeriodEnd = stripePeriodEnd
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: stripeStatus,
              current_period_end: stripePeriodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
        }
      } catch {
        // Stripe unreachable — fall back to DB value
      }
    }

    // Check if subscription is still valid (even if canceled, access until period end)
    const isActive =
      status === "active" ||
      status === "trialing" ||
      (status === "canceled" &&
       currentPeriodEnd &&
       new Date(currentPeriodEnd) > new Date())

    return NextResponse.json({
      status: status || "none",
      active: isActive,
      currentPeriodEnd,
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
