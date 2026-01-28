import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe, PRICES } from "@/lib/stripe"

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

    // Get or create profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
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

      // Update profile with Stripe customer ID
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id)
    }

    // Check if user already used promo
    const promoUsed = profile?.promo_used || false

    // Create checkout session
    // If promo not used: $1.99 first month, then $6.99/month
    // If promo used: $6.99/month directly
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: promoUsed ? PRICES.REGULAR : PRICES.PROMO,
          quantity: 1,
        },
      ],
      subscription_data: promoUsed ? undefined : {
        // After first month at $1.99, switch to $6.99
        metadata: {
          promo_applied: "true",
        },
      },
      success_url: `${baseUrl}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        user_id: user.id,
        promo_applied: promoUsed ? "false" : "true",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
