export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", user.id)
      .single()

    let subscriptionId = profile?.stripe_subscription_id

    // If no direct subscription ID, look it up from Stripe via customer ID
    if (!subscriptionId && profile?.stripe_customer_id) {
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      }) as any
      if (subs.data.length === 0) {
        // Try trialing too
        const trialSubs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "trialing",
          limit: 1,
        }) as any
        if (trialSubs.data.length > 0) subscriptionId = trialSubs.data[0].id
      } else {
        subscriptionId = subs.data[0].id
      }
      // Save it for next time
      if (subscriptionId) {
        await supabaseAdmin
          .from("profiles")
          .update({ stripe_subscription_id: subscriptionId })
          .eq("id", user.id)
      }
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Cancel at period end (user keeps access until end of paid period)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    }) as any

    // Update DB
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "canceled",
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    })
  } catch (error: any) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: error?.message || "Failed to cancel" }, { status: 500 })
  }
}
