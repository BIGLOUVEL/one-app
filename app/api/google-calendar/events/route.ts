import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentWeekBounds(): { timeMin: string; timeMax: string } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return {
    timeMin: monday.toISOString(),
    timeMax: sunday.toISOString(),
  }
}

async function refreshAccessToken(
  refreshToken: string,
  userId: string
): Promise<string | null> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  const data = await response.json()
  if (!response.ok || !data.access_token) {
    console.error("Google token refresh failed:", data)
    return null
  }

  const expiresAt = new Date(
    Date.now() + (data.expires_in || 3600) * 1000
  ).toISOString()

  await supabaseAdmin
    .from("profiles")
    .update({
      google_calendar_access_token: data.access_token,
      google_calendar_token_expiry: expiresAt,
    })
    .eq("id", userId)

  return data.access_token
}

const DAY_MAP = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

function inferCategory(summary: string): string {
  const lower = summary.toLowerCase()
  if (lower.includes("meeting") || lower.includes("call") || lower.includes("réunion") || lower.includes("appel") || lower.includes("sync") || lower.includes("standup")) return "Meeting"
  if (lower.includes("class") || lower.includes("cours") || lower.includes("lecture") || lower.includes("td") || lower.includes("tp") || lower.includes("exam")) return "Class"
  if (lower.includes("gym") || lower.includes("sport") || lower.includes("run") || lower.includes("exercise") || lower.includes("yoga") || lower.includes("musculation")) return "Exercise"
  if (lower.includes("lunch") || lower.includes("dinner") || lower.includes("déjeuner") || lower.includes("dîner") || lower.includes("break") || lower.includes("pause") || lower.includes("repas")) return "Break"
  if (lower.includes("commute") || lower.includes("trajet") || lower.includes("transport") || lower.includes("drive")) return "Commute"
  if (lower.includes("social") || lower.includes("party") || lower.includes("friends") || lower.includes("soirée") || lower.includes("apéro")) return "Social"
  if (lower.includes("focus") || lower.includes("deep work") || lower.includes("travail") || lower.includes("work")) return "Deep Work"
  if (lower.includes("admin") || lower.includes("email") || lower.includes("mail")) return "Admin"
  return "Other"
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

    // Get stored Google tokens
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("google_calendar_access_token, google_calendar_refresh_token, google_calendar_token_expiry")
      .eq("id", user.id)
      .single()

    if (!profile?.google_calendar_access_token) {
      return NextResponse.json({ connected: false, events: [] })
    }

    // Check if token needs refresh (5 min buffer)
    let accessToken = profile.google_calendar_access_token
    const expiry = profile.google_calendar_token_expiry
      ? new Date(profile.google_calendar_token_expiry)
      : null
    const needsRefresh = !expiry || expiry.getTime() - Date.now() < 5 * 60 * 1000

    if (needsRefresh && profile.google_calendar_refresh_token) {
      const newToken = await refreshAccessToken(
        profile.google_calendar_refresh_token,
        user.id
      )
      if (!newToken) {
        // Token revoked — clear stored tokens
        await supabaseAdmin
          .from("profiles")
          .update({
            google_calendar_access_token: null,
            google_calendar_refresh_token: null,
            google_calendar_token_expiry: null,
          })
          .eq("id", user.id)
        return NextResponse.json({ connected: false, events: [], expired: true })
      }
      accessToken = newToken
    }

    // Fetch events from Google Calendar API
    const { timeMin, timeMax } = getCurrentWeekBounds()
    const calendarUrl = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    )
    calendarUrl.searchParams.set("timeMin", timeMin)
    calendarUrl.searchParams.set("timeMax", timeMax)
    calendarUrl.searchParams.set("singleEvents", "true")
    calendarUrl.searchParams.set("orderBy", "startTime")
    calendarUrl.searchParams.set("maxResults", "100")

    const calendarResponse = await fetch(calendarUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!calendarResponse.ok) {
      const errData = await calendarResponse.json().catch(() => ({}))
      console.error("Google Calendar API error:", errData)
      if (calendarResponse.status === 401) {
        return NextResponse.json({ connected: false, events: [], expired: true })
      }
      return NextResponse.json(
        { error: "Failed to fetch calendar events" },
        { status: 500 }
      )
    }

    const calendarData = await calendarResponse.json()

    // Map Google events to TimetableEvent format
    const events = (calendarData.items || [])
      .filter((item: any) => item.start?.dateTime) // Skip all-day events
      .map((item: any) => {
        const start = new Date(item.start.dateTime)
        const end = new Date(item.end.dateTime)
        const title = item.summary || "Untitled"

        return {
          id: `gcal-${item.id}`,
          day: DAY_MAP[start.getDay()],
          startTime: `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
          endTime: `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`,
          title,
          category: inferCategory(title),
          priority: "medium" as const,
          source: "google" as const,
          googleEventId: item.id,
          createdAt: item.created || new Date().toISOString(),
        }
      })

    return NextResponse.json({ connected: true, events })
  } catch (error: any) {
    console.error("Google Calendar events error:", error)
    return NextResponse.json(
      { error: `Failed: ${error?.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}
