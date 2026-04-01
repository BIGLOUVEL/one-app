export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Brevo removed — newsletter subscribe is a no-op
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Newsletter subscribe error:", error)
    return NextResponse.json({ success: true })
  }
}
