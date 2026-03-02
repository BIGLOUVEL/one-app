export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getBrevoContactsApi, BREVO_LIST_ID } from "@/lib/brevo"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const contactsApi = getBrevoContactsApi()

    await contactsApi.createContact({
      email: email.toLowerCase().trim(),
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[waitlist] brevo error:", err?.body || err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
