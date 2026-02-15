import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const state = requestUrl.searchParams.get("state") // user.id
  const error = requestUrl.searchParams.get("error")

  const origin = requestUrl.origin

  if (error) {
    return NextResponse.redirect(new URL("/app/timetable?gcal=denied", origin))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/app/timetable?gcal=error", origin))
  }

  try {
    // Build the same redirect URI used in the auth route
    const host = request.headers.get("host") || "localhost:3000"
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.match(/^10\./) || host.match(/^192\.168\./)
    const protocol = isLocal ? "http" : "https"
    const redirectUri = `${protocol}://${host}/api/google-calendar/callback`

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error("Google token exchange failed:", tokens)
      return NextResponse.redirect(new URL("/app/timetable?gcal=error", origin))
    }

    // Calculate token expiry
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000
    ).toISOString()

    // Store tokens in profiles table
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        google_calendar_access_token: tokens.access_token,
        google_calendar_refresh_token: tokens.refresh_token || null,
        google_calendar_token_expiry: expiresAt,
      })
      .eq("id", state)

    if (updateError) {
      console.error("Failed to store Google tokens:", updateError)
      return NextResponse.redirect(new URL("/app/timetable?gcal=error", origin))
    }

    return NextResponse.redirect(new URL("/app/timetable?gcal=connected", origin))
  } catch (err: any) {
    console.error("Google Calendar callback error:", err)
    return NextResponse.redirect(new URL("/app/timetable?gcal=error", origin))
  }
}
