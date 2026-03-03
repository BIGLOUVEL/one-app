export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Statuses where Stripe is always re-queried (DB value not reliable)
const STALE_STATUSES = new Set(["none", "past_due", "incomplete", "incomplete_expired", null, undefined, ""])

// Returns true if we should skip the Stripe live-check and trust the DB
function isDbHealthy(status: string | null, periodEnd: string | null): boolean {
  if (STALE_STATUSES.has(status as any)) return false
  if (!periodEnd) return false
  // Re-check if period ends within 2 days (upcoming renewal / potential cancellation)
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  return new Date(periodEnd) > twoDaysFromNow
}

async function findStripeSubscription(customerId?: string, email?: string) {
  const statuses = ["active", "trialing", "past_due"]

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

    // ?billing=1 forces a Stripe live-check (used by settings page for accurate pricing)
    const forceBilling = request.nextUrl.searchParams.get("billing") === "1"

    // Skip Stripe call if DB data is healthy and not expiring soon — avoids rate limits
    const skipStripe = !forceBilling && isDbHealthy(status, currentPeriodEnd) && !!profile.stripe_subscription_id

    if (!skipStripe) {
      try {
        let sub: any = null

        if (profile.stripe_subscription_id) {
          sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id, {
            expand: ["items.data.price"],
          }) as any
        } else {
          const found = await findStripeSubscription(profile.stripe_customer_id, user.email)
          if (found) {
            sub = await stripe.subscriptions.retrieve(found.id, { expand: ["items.data.price"] }) as any
            await supabaseAdmin.from("profiles").update({ stripe_subscription_id: found.id }).eq("id", user.id)
          }
        }

        if (sub) {
          // Use upcoming invoice for accurate next billing amount
          try {
            const upcoming = await stripe.invoices.createPreview({ subscription: sub.id }) as any
            if (upcoming?.amount_due != null) {
              priceAmount = upcoming.amount_due
              priceCurrency = upcoming.currency
            }
          } catch {
            const item = sub.items?.data?.[0]
            if (item?.price) {
              priceAmount = item.price.unit_amount
              priceCurrency = item.price.currency
            }
          }

          const stripeStatus = sub.status
          const rawEnd = (sub as any).current_period_end
          const stripePeriodEnd = (rawEnd != null && !isNaN(Number(rawEnd)))
            ? new Date(Number(rawEnd) * 1000).toISOString()
            : null

          if (!status || status === "none" || status !== stripeStatus) {
            status = stripeStatus
            if (stripePeriodEnd) currentPeriodEnd = stripePeriodEnd
            const dbUpdate: Record<string, any> = {
              subscription_status: stripeStatus,
              updated_at: new Date().toISOString(),
            }
            if (stripePeriodEnd) dbUpdate.current_period_end = stripePeriodEnd
            await supabaseAdmin.from("profiles").update(dbUpdate).eq("id", user.id)
          }
        }
      } catch {
        // Stripe unreachable — fall back to DB value
      }
    }

    const isActive =
      status === "active" ||
      status === "trialing" ||
      status === "past_due" || // Payment failed but Stripe is still retrying — keep access
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
