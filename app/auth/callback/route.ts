import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirect = requestUrl.searchParams.get("redirect") || "/app"
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // This can happen in certain environments
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password recovery — redirect to reset form
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin))
      }
      return NextResponse.redirect(new URL(redirect, requestUrl.origin))
    }

    // Pass the real error to login so user can see what went wrong
    const errorUrl = new URL("/login", requestUrl.origin)
    errorUrl.searchParams.set("error", "auth_error")
    errorUrl.searchParams.set("message", error.message)
    return NextResponse.redirect(errorUrl)
  }

  // No code or invalid request
  const errorUrl = new URL("/login", requestUrl.origin)
  errorUrl.searchParams.set("error", "auth_error")
  errorUrl.searchParams.set("message", "missing_code")
  return NextResponse.redirect(errorUrl)
}
