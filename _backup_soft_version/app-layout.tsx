"use client"

import Link from "next/link"
import { AppNav, MobileNav } from "@/components/app/app-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Link href="/app" className="flex items-center gap-2 group lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                <span className="text-background font-display font-semibold text-xs">D</span>
              </div>
              <span className="text-sm font-medium hidden sm:block">DeadSign</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:block">
              Press <kbd>&#8984;B</kbd> to toggle sidebar
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </AppNav>
  )
}
