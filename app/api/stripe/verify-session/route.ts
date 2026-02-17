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
    })

    // Verify session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "Session does not belong to user" }, { status: 403 })
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Get subscription details
    const subscription = session.subscription as any
    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 })
    }

    // Upsert profile in Supabase (handles case where profile doesn't exist yet)
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || "",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        promo_used: session.metadata?.promo_applied === "true",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })

    if (upsertError) {
      console.error("Failed to upsert profile:", upsertError)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    // Double-check the update actually persisted
    const { data: verifyProfile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single()

    if (verifyProfile?.subscription_status !== "active") {
      console.error("Profile update verification failed. Status:", verifyProfile?.subscription_status)
      return NextResponse.json({ error: "Subscription status not saved" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: subscription.status,
      message: "Subscription activated successfully"
    })
  } catch (error) {
    console.error("Verify session error:", error)
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    )
  }
}
