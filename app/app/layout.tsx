"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppNav, MobileNav } from "@/components/app/app-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { Logo } from "@/components/ui/logo"
import { PaymentVerifier } from "@/components/app/payment-verifier"
import { DailyDominoCheck } from "@/components/app/daily-domino-check"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"

function UserGuard() {
  const { user } = useAuth()
  const hasHydrated = useHasHydrated()
  const { userId, setUserId, clearAllData } = useAppStore()

  // Sync Zustand state with Supabase (load on login, save on changes)
  useSupabaseSync()

  useEffect(() => {
    if (!hasHydrated || !user) return

    // Different user logged in — clear stale data
    if (userId && userId !== user.id) {
      clearAllData()
    }
    // Always sync the current user ID
    if (userId !== user.id) {
      setUserId(user.id)
    }
  }, [hasHydrated, user, userId, setUserId, clearAllData])

  return null
}

function AppHeader() {
  const { currentSession } = useAppStore()
  const hasHydrated = useHasHydrated()
  const pathname = usePathname()

  // Don't render until hydrated (prevents SidebarProvider prerender crash)
  if (!hasHydrated) return null

  // Hide header during active focus session (bunker mode) or onboarding
  if (currentSession) return null
  if (pathname === "/app/onboarding") return null

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-4 w-px bg-border hidden sm:block" />
        <Link href="/app" className="flex items-center gap-2 group">
          <div className="relative lg:hidden">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Logo size="md" className="relative" />
          </div>
          <span className="text-sm font-medium text-muted-foreground hidden sm:block lg:hidden">ONE</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          Press <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border rounded">⌘B</kbd> to toggle sidebar
        </span>
      </div>
    </header>
  )
}

function AppMobileNav() {
  const { currentSession } = useAppStore()
  const pathname = usePathname()

  // Hide mobile nav during active focus session (bunker mode) or onboarding
  if (currentSession) return null
  if (pathname === "/app/onboarding") return null

  return <MobileNav />
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppNav>
      {/* Clear stale data when a different user logs in */}
      <UserGuard />

      {/* Daily domino check - first visit of the day */}
      <DailyDominoCheck />

      {/* Payment verification on return from Stripe */}
      <Suspense fallback={null}>
        <PaymentVerifier />
      </Suspense>

      <div className="min-h-screen bg-background">
        {/* Header - hidden during onboarding */}
        <AppHeader />

        {/* Main Content */}
        <main className="pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Navigation - hidden during onboarding */}
        <AppMobileNav />
      </div>
    </AppNav>
  )
}
