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
    // Get base URL - handle 0.0.0.0 and local IPs
    const host = request.headers.get("host") || "localhost:3000"
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.match(/^10\./) || host.match(/^192\.168\./) || host.match(/^172\./)
    const protocol = isLocal ? "http" : "https"
    const baseUrl = `${protocol}://${host}`

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

    // Ensure profile exists (upsert handles race condition with auth trigger)
    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email || "" },
        { onConflict: "id", ignoreDuplicates: true }
      )

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    let stripeCustomerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id

      // Save Stripe customer ID to profile
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (updateError) {
        console.error("Failed to save stripe_customer_id:", updateError)
      }
    }

    // Get price ID - use env var, or find active price from Stripe
    let priceId = process.env.STRIPE_PRICE_ID_PROMO || process.env.STRIPE_PRICE_ID_REGULAR

    if (!priceId) {
      // Fallback: fetch the first active recurring price from Stripe
      const prices = await stripe.prices.list({ active: true, type: "recurring", limit: 10 })
      if (prices.data.length === 0) {
        return NextResponse.json(
          { error: "No active prices found in Stripe. Create a product with a recurring price first." },
          { status: 500 }
        )
      }
      // Pick the cheapest one (promo) or the first available
      priceId = prices.data.sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0))[0].id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    // Return the actual Stripe error message for debugging
    const message = error?.message || error?.raw?.message || "Unknown error"
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    )
  }
}
