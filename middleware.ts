import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  const isProtectedRoute = pathname.startsWith("/app")
  const isAuthCallback = pathname.startsWith("/auth/callback")
  const isAuthReset = pathname.startsWith("/auth/reset-password")
  const isOnboardingPage = pathname === "/app/onboarding"
  const isAnalysisPage = pathname.startsWith("/app/analysis")

  // Allow auth callback and reset password
  if (isAuthCallback || isAuthReset) {
    return supabaseResponse
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // For logged-in users on /app/* — check subscription only
  // Onboarding is handled client-side via Zustand store
  if (isProtectedRoute && user && !isOnboardingPage && !isAnalysisPage) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_status, current_period_end")
      .eq("id", user.id)
      .single()

    // Subscription check in production
    const hasSessionId = request.nextUrl.searchParams.has("session_id")
    if (!hasSessionId && process.env.NODE_ENV !== "development") {
      const isSubscribed = profile?.subscription_status === "active" ||
        (profile?.subscription_status === "canceled" &&
         profile?.current_period_end &&
         new Date(profile.current_period_end) > new Date())

      if (!isSubscribed) {
        const url = request.nextUrl.clone()
        url.pathname = "/pricing"
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect if already logged in and accessing auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    const redirect = request.nextUrl.searchParams.get("redirect")
    url.pathname = redirect && redirect.startsWith("/") ? redirect : "/app"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
