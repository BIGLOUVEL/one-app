export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const origin = request.headers.get("origin") || "https://makeitreal.one"

    // Generate password reset link via Supabase Admin
    // This doesn't send any email — we handle sending ourselves
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: `${origin}/auth/reset-password`,
      },
    })

    if (error) {
      console.error("[reset-email] generateLink error:", error.message)
      // Don't reveal whether the email exists — always return success for security
      return NextResponse.json({ success: true })
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      return NextResponse.json({ success: true })
    }

    // Try Resend first if key is configured
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const { error: sendError } = await resend.emails.send({
        from: "ONE <noreply@makeitreal.one>",
        to: email,
        subject: "Reset your ONE password",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#111111;border-radius:16px;border:1px solid #1f1f1f;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#00d46a;">ONE</p>
              <p style="margin:4px 0 0;font-size:10px;color:#444;letter-spacing:0.15em;text-transform:uppercase;">Focus Operating System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Reset your password</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#888;line-height:1.6;">
                We received a request to reset the password for your ONE account associated with <strong style="color:#aaa;">${email}</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${resetLink}"
                       style="display:inline-block;padding:14px 32px;background-color:#00d46a;color:#000000;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">
                      Reset my password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:#555;line-height:1.6;">
                This link expires in <strong style="color:#777;">1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account is secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#333;line-height:1.6;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <span style="color:#444;word-break:break-all;">${resetLink}</span>
              </p>
            </td>
          </tr>

        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#333;">
          © ${new Date().getFullYear()} ONE — Focus Operating System · <a href="https://makeitreal.one/privacy" style="color:#444;text-decoration:underline;">Privacy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      })

      if (!sendError) {
        return NextResponse.json({ success: true })
      }
      console.error("[reset-email] Resend error, falling back to Supabase:", sendError)
    }

    // Fallback: use Supabase's built-in password reset email
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: nativeError } = await supabasePublic.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo: `${origin}/auth/reset-password` }
    )

    if (nativeError) {
      console.error("[reset-email] Native reset error:", nativeError.message)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[reset-email] Unexpected error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
