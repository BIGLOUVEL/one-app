"use client"

import Link from "next/link"
import { Target, PanelLeft } from "lucide-react"
import { AppNav, MobileNav } from "@/components/app/app-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

function AppHeader() {
  const { objective, hasCompletedOnboarding } = useAppStore()
  const isOnboarding = !objective || !hasCompletedOnboarding

  // Hide header during onboarding
  if (isOnboarding) return null

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-4 w-px bg-border hidden sm:block" />
        <Link href="/app" className="flex items-center gap-2 group">
          <div className="relative lg:hidden">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
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
  const { objective, hasCompletedOnboarding } = useAppStore()
  const isOnboarding = !objective || !hasCompletedOnboarding

  // Hide mobile nav during onboarding
  if (isOnboarding) return null

  return <MobileNav />
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppNav>
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
