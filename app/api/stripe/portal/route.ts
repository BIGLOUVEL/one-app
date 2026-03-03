export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findStripeCustomerId(dbCustomerId?: string, email?: string): Promise<string | null> {
  if (dbCustomerId) return dbCustomerId

  if (email) {
    const customers = await stripe.customers.list({ email, limit: 5 }) as any
    if (customers.data.length > 0) return customers.data[0].id
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
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    const customerId = await findStripeCustomerId(profile?.stripe_customer_id, user.email)

    if (!customerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Persist customer ID for future lookups
    if (!profile?.stripe_customer_id) {
      await supabaseAdmin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.nextUrl.origin}/app/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
