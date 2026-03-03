export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findStripeSubscription(customerId?: string, email?: string) {
  const statuses = ["active", "trialing"]

  if (customerId) {
    for (const status of statuses) {
      const list = await stripe.subscriptions.list({ customer: customerId, status: status as any, limit: 1 }) as any
      if (list.data.length > 0) return list.data[0]
    }
  }

  if (email) {
    const customers = await stripe.customers.list({ email, limit: 5 }) as any
    for (const customer of customers.data) {
      for (const status of statuses) {
        const list = await stripe.subscriptions.list({ customer: customer.id, status: status as any, limit: 1 }) as any
        if (list.data.length > 0) return list.data[0]
      }
    }
  }

  return null
}

export async function GET(request: NextRequest) {
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

    // Always check Stripe as source of truth
    try {
      let sub: any = null

      if (profile.stripe_subscription_id) {
        sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id) as any
      } else {
        // No subscription ID in DB — look up by customer ID or email
        sub = await findStripeSubscription(profile.stripe_customer_id, user.email)
        // Persist for next time
        if (sub) {
          await supabaseAdmin.from("profiles").update({ stripe_subscription_id: sub.id }).eq("id", user.id)
        }
      }

      if (sub) {
        const item = sub.items.data[0]
        if (item?.price) {
          priceAmount = item.price.unit_amount
          priceCurrency = item.price.currency
        }

        const stripeStatus = sub.status
        const stripePeriodEnd = new Date(sub.current_period_end * 1000).toISOString()

        if (!status || status === "none" || status !== stripeStatus) {
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
      }
    } catch {
      // Stripe unreachable — fall back to DB value
    }

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
