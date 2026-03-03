import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Raw body is needed for Stripe signature verification — disable body parsing
export const dynamic = "force-dynamic"

const safeDate = (ts: any): string | null => {
  if (ts == null) return null
  const ms = Number(ts) * 1000
  return isNaN(ms) ? null : new Date(ms).toISOString()
}

async function findUserByCustomerId(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single()
  return data?.id ?? null
}

async function findUserByEmail(email: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single()
  return data?.id ?? null
}

async function activateUser(userId: string, session: Stripe.Checkout.Session) {
  const update: Record<string, any> = {
    updated_at: new Date().toISOString(),
    subscription_status: "active",
  }

  if (session.customer) update.stripe_customer_id = session.customer as string

  // Try to get subscription details
  let sub: Stripe.Subscription | null = null
  if (session.subscription) {
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id
    try {
      sub = await stripe.subscriptions.retrieve(subId) as Stripe.Subscription
    } catch { /* ignore */ }
  }

  if (sub) {
    update.stripe_subscription_id = sub.id
    update.subscription_status = sub.status
    const periodEnd = safeDate((sub as any).current_period_end)
    if (periodEnd) update.current_period_end = periodEnd
  }

  if (session.metadata?.promo_applied) {
    update.promo_used = session.metadata.promo_applied === "true"
  }

  await supabaseAdmin.from("profiles").upsert({ id: userId, ...update }, { onConflict: "id" })
  console.log("webhook: activated user", userId, "status:", update.subscription_status)
}

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string
  let userId = await findUserByCustomerId(customerId)

  if (!userId) {
    // Try to find by email via Stripe customer
    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      if (!customer.deleted && customer.email) {
        userId = await findUserByEmail(customer.email)
        if (userId) {
          // Persist customer ID for future lookups
          await supabaseAdmin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId)
        }
      }
    } catch { /* ignore */ }
  }

  if (!userId) {
    console.warn("webhook: no user found for customer", customerId)
    return
  }

  const periodEnd = safeDate((sub as any).current_period_end)
  const update: Record<string, any> = {
    subscription_status: sub.status,
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
  }
  if (periodEnd) update.current_period_end = periodEnd

  await supabaseAdmin.from("profiles").update(update).eq("id", userId)
  console.log("webhook: synced subscription for user", userId, "status:", sub.status)
}

async function handleInvoicePaid(invoice: any) {
  const customerId = invoice.customer as string
  const subId = invoice.subscription as string | null
  if (!subId) return

  const userId = await findUserByCustomerId(customerId)
  if (!userId) return

  // Refresh subscription to get updated period end
  try {
    const sub = await stripe.subscriptions.retrieve(subId) as any
    const periodEnd = safeDate(sub.current_period_end)
    const update: Record<string, any> = {
      subscription_status: sub.status,
      updated_at: new Date().toISOString(),
    }
    if (periodEnd) update.current_period_end = periodEnd
    await supabaseAdmin.from("profiles").update(update).eq("id", userId)
    console.log("webhook: invoice.paid — updated period_end for user", userId)
  } catch (e) {
    console.error("webhook: failed to refresh subscription after invoice.paid", e)
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const sig = request.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== "paid" && session.mode !== "subscription") break

        let userId = session.metadata?.user_id
        if (!userId && session.customer) {
          userId = await findUserByCustomerId(session.customer as string) ?? undefined
        }
        if (!userId && session.customer_email) {
          userId = await findUserByEmail(session.customer_email) ?? undefined
        }

        if (!userId) {
          console.error("webhook: checkout.session.completed — no user found", session.id)
          break
        }

        await activateUser(userId, session)
        break
      }

      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case "customer.subscription.deleted": {
        // Subscription truly ended (expired or payment failed) — cut access
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const userId = await findUserByCustomerId(customerId)
        if (userId) {
          await supabaseAdmin.from("profiles").update({
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          }).eq("id", userId)
          console.log("webhook: subscription deleted — access cut for user", userId)
        }
        break
      }

      case "invoice.paid": {
        await handleInvoicePaid(event.data.object as any)
        break
      }

      case "invoice.payment_failed": {
        // Optional: could send email, mark in DB, etc.
        const invoice = event.data.object as any
        console.warn("webhook: invoice.payment_failed for customer", invoice.customer)
        break
      }

      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    // Still return 200 to prevent Stripe from retrying non-retriable errors
  }

  return NextResponse.json({ received: true })
}
