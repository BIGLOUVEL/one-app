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
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

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

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    }) as any

    // Verify session belongs to this user (soft check — log but don't block on mismatch)
    if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
      console.error("verify-session: user_id mismatch", {
        sessionUserId: session.metadata.user_id,
        authUserId: user.id,
      })
      return NextResponse.json({ error: "Session does not belong to user" }, { status: 403 })
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed", paymentStatus: session.payment_status }, { status: 400 })
    }

    // Get subscription details — it may be an object (expanded) or a string ID
    let subscription: any = session.subscription
    if (typeof subscription === "string") {
      // Not expanded for some reason — retrieve it
      try {
        subscription = await stripe.subscriptions.retrieve(subscription) as any
      } catch (e) {
        console.error("verify-session: failed to retrieve subscription", e)
      }
    }

    // Build the profile update — guard every field against null/undefined
    const safeDate = (ts: any): string | null => {
      if (ts == null) return null
      const ms = Number(ts) * 1000
      return isNaN(ms) ? null : new Date(ms).toISOString()
    }

    const profileUpdate: Record<string, any> = {
      id: user.id,
      email: user.email || "",
      updated_at: new Date().toISOString(),
    }

    if (session.customer) profileUpdate.stripe_customer_id = session.customer as string
    if (session.metadata?.promo_applied) profileUpdate.promo_used = session.metadata.promo_applied === "true"

    if (subscription) {
      profileUpdate.stripe_subscription_id = subscription.id
      profileUpdate.subscription_status = subscription.status || "active"
      const periodEnd = safeDate(subscription.current_period_end)
      if (periodEnd) profileUpdate.current_period_end = periodEnd
    } else {
      // No subscription object but payment is confirmed — mark as active
      profileUpdate.subscription_status = "active"
    }

    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileUpdate, { onConflict: "id" })

    if (upsertError) {
      console.error("verify-session: failed to upsert profile:", upsertError)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: profileUpdate.subscription_status,
      message: "Subscription activated successfully",
    })
  } catch (error: any) {
    console.error("Verify session error:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to verify session", detail: error?.message },
      { status: 500 }
    )
  }
}
