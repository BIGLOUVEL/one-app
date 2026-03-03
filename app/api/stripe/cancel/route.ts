export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Find any cancellable subscription (active or trialing) — no status filter so we catch all
async function findCancellableSubscription(customerId?: string, email?: string): Promise<any | null> {
  const isCancellable = (sub: any) => sub.status === "active" || sub.status === "trialing"

  // 1. Via customer ID stored in DB
  if (customerId) {
    const list = await stripe.subscriptions.list({ customer: customerId, limit: 10 }) as any
    const sub = list.data.find(isCancellable)
    if (sub) return sub
  }

  // 2. Via email → find all Stripe customers with that email
  if (email) {
    const customers = await stripe.customers.list({ email, limit: 5 }) as any
    for (const customer of customers.data) {
      const list = await stripe.subscriptions.list({ customer: customer.id, limit: 10 }) as any
      const sub = list.data.find(isCancellable)
      if (sub) return sub
    }
  }

  return null
}

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

    // If we have the ID, verify it's still cancellable
    let sub: any = null
    if (subscriptionId) {
      try {
        sub = await stripe.subscriptions.retrieve(subscriptionId) as any
        if (sub.status !== "active" && sub.status !== "trialing") {
          sub = null
          subscriptionId = null
        }
      } catch {
        subscriptionId = null
      }
    }

    // Fall back: find by customer ID or email
    if (!subscriptionId) {
      sub = await findCancellableSubscription(profile?.stripe_customer_id, user.email)
      if (sub) {
        subscriptionId = sub.id
        await supabaseAdmin.from("profiles").update({ stripe_subscription_id: sub.id }).eq("id", user.id)
      }
    }

    if (!sub || !subscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    // If already set to cancel at period end, just return success
    if (sub.cancel_at_period_end) {
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString()
      return NextResponse.json({ success: true, currentPeriodEnd: periodEnd, alreadyCanceled: true })
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    }) as any

    const periodEnd = new Date(updated.current_period_end * 1000).toISOString()

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "canceled",
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    return NextResponse.json({ success: true, currentPeriodEnd: periodEnd })
  } catch (error: any) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: error?.message || "Failed to cancel" }, { status: 500 })
  }
}
