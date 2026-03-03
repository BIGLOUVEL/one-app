export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"

// Google Cross-Account Protection (RISC) endpoint
// Receives security event tokens when a user's Google account has security events
// https://developers.google.com/identity/protocols/risc
export async function POST(request: NextRequest) {
  try {
    // Accept and acknowledge the security event token
    // In production you could parse the JWT and act on specific events
    // (session_revoked, account_disabled, account_purged, etc.)
    await request.text() // consume body
    return new NextResponse(null, { status: 202 })
  } catch {
    return new NextResponse(null, { status: 202 })
  }
}
