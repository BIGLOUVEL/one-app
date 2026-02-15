import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Build redirect URI
    const host = request.headers.get("host") || "localhost:3000"
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.match(/^10\./) || host.match(/^192\.168\./)
    const protocol = isLocal ? "http" : "https"
    const redirectUri = `${protocol}://${host}/api/google-calendar/callback`

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
      state: user.id,
    })

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({ url: googleAuthUrl })
  } catch (error: any) {
    console.error("Google Calendar auth error:", error)
    return NextResponse.json(
      { error: `Auth failed: ${error?.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}
