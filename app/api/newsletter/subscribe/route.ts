import { NextRequest, NextResponse } from "next/server"
import { getBrevoContactsApi, BREVO_LIST_ID } from "@/lib/brevo"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const contactsApi = getBrevoContactsApi()

    await contactsApi.createContact({
      email,
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Silent success even on error — newsletter is non-critical
    console.error("Newsletter subscribe error:", error?.body || error)
    return NextResponse.json({ success: true })
  }
}
