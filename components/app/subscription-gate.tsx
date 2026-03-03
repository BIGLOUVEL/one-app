"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

// Pages that don't require subscription (onboarding flow + settings)
const EXEMPT_PATHS = ["/app/onboarding", "/app/analysis", "/app/settings"]

export function SubscriptionGate() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, session } = useAuth()
  const hasHydrated = useHasHydrated()
  const { hasCompletedOnboarding } = useAppStore()
  const checkedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!hasHydrated || !user || !session) return
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return
    // Returning from Stripe checkout — let PaymentVerifier handle activation
    if (searchParams.get("session_id")) return
    if (!hasCompletedOnboarding) return

    // Deduplicate: don't re-check for same user+path combo
    const checkKey = `${user.id}:${pathname}`
    if (checkedKeyRef.current === checkKey) return

    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        // On any server error, fail open — never lock out a paying user
        if (!res.ok) {
          console.error("[subscription] Status check returned", res.status, "— failing open")
          checkedKeyRef.current = checkKey
          return
        }

        const data = await res.json()
        checkedKeyRef.current = checkKey

        if (data.active === false) {
          router.replace("/pricing")
        }
      } catch (err) {
        console.error("[subscription] Failed to check status:", err)
        // Fail open on network error
        checkedKeyRef.current = checkKey
      }
    }

    checkSubscription()
  }, [hasHydrated, user, session, hasCompletedOnboarding, pathname, searchParams, router])

  return null
}
