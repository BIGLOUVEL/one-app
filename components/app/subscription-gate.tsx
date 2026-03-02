"use client"

import { useEffect, useState, useRef } from "react"
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
  const [hasChecked, setHasChecked] = useState(false)
  const checkedUserRef = useRef<string | null>(null)

  useEffect(() => {
    // Don't check until store is hydrated and user is logged in
    if (!hasHydrated || !user || !session) return

    // Don't block exempt pages
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return

    // Payment verification in progress (returning from Stripe checkout)
    // Let PaymentVerifier handle this — don't race against it
    if (searchParams.get("session_id")) return

    // User hasn't completed onboarding yet — no paywall needed
    if (!hasCompletedOnboarding) return

    // Already checked for this user
    if (hasChecked && checkedUserRef.current === user.id) return

    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        // On any server error, fail open — never lock out a paying user
        if (!res.ok) {
          console.error("[subscription] Status check returned", res.status, "— failing open")
          setHasChecked(true)
          checkedUserRef.current = user.id
          return
        }

        const data = await res.json()

        if (data.active === false) {
          // Explicitly not subscribed — redirect to pricing
          router.replace("/pricing")
        }

        checkedUserRef.current = user.id
        setHasChecked(true)
      } catch (err) {
        console.error("[subscription] Failed to check status:", err)
        // On network error, don't block — fail open to avoid locking out users
        setHasChecked(true)
        checkedUserRef.current = user.id
      }
    }

    checkSubscription()
  }, [hasHydrated, user, session, hasCompletedOnboarding, pathname, searchParams, hasChecked, router])

  return null
}
