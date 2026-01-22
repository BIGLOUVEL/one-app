"use client"

import Link from "next/link"
import { Target } from "lucide-react"
import { AppNav, MobileNav } from "@/components/app/app-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b border-white/[0.04] bg-[hsl(220,20%,4%)]/90 backdrop-blur-lg">
        <Link href="/app" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-semibold tracking-tight">DeadSign</span>
            <span className="text-xs text-muted-foreground ml-2">The ONE Thing OS</span>
          </div>
        </Link>
      </header>

      {/* Sidebar Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
