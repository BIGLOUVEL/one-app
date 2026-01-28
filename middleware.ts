import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/app")
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback")
  const isPricingPage = request.nextUrl.pathname === "/pricing"

  // Allow auth callback
  if (isAuthCallback) {
    return supabaseResponse
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check subscription for protected routes (production only)
  if (isProtectedRoute && user) {
    // Allow access if returning from Stripe checkout (session_id present)
    const hasSessionId = request.nextUrl.searchParams.has("session_id")
    if (hasSessionId) {
      return supabaseResponse
    }

    // Skip subscription check in development
    if (process.env.NODE_ENV !== "development") {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_status, current_period_end")
        .eq("id", user.id)
        .single()

      // If profile doesn't exist or table error, let user through (new user)
      if (profile && !profileError) {
        const isSubscribed = profile.subscription_status === "active" ||
          (profile.subscription_status === "canceled" &&
           profile.current_period_end &&
           new Date(profile.current_period_end) > new Date())

        if (!isSubscribed) {
          const url = request.nextUrl.clone()
          url.pathname = "/pricing"
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // Redirect to app if already logged in and accessing auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/app"
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
