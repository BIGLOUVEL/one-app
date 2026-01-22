"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Target,
  Focus,
  GitBranch,
  Calendar,
  Map,
  Timer,
  Flame,
  Shield,
  ClipboardCheck,
  Plus,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

const navItems = [
  { href: "/app", label: "Dashboard", icon: Target, description: "Your ONE thing" },
  { href: "/app/define", label: "Define", icon: Plus, description: "Set objective" },
  { href: "/app/domino", label: "Domino", icon: GitBranch, description: "Goal alignment" },
  { href: "/app/411", label: "4-1-1", icon: Calendar, description: "Weekly planning" },
  { href: "/app/gps", label: "GPS", icon: Map, description: "Strategy plan" },
  { href: "/app/focus", label: "Focus", icon: Timer, description: "Deep work session" },
  { href: "/app/habit", label: "66 Days", icon: Flame, description: "Build the habit" },
  { href: "/app/shield", label: "Shield", icon: Shield, description: "Fight the thieves" },
  { href: "/app/review", label: "Review", icon: ClipboardCheck, description: "Weekly reflection" },
]

export function AppNav() {
  const pathname = usePathname()
  const { objective, isLocked } = useAppStore()
  const locked = isLocked()

  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 border-r border-white/[0.04] bg-[hsl(220,20%,4%)] p-4 hidden lg:block">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isDefine = item.href === "/app/define"
          const isDisabled = isDefine && locked

          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : isDisabled
                  ? "opacity-40 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}

              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-primary/20" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
              )}>
                {isDisabled ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <item.icon className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isDisabled ? "Finish first" : item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Objective Status */}
      {objective && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className={cn(
            "rounded-xl p-3 border",
            objective.status === "active"
              ? "bg-primary/5 border-primary/20"
              : objective.status === "completed"
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {objective.status === "active" ? (
                <Lock className="h-3 w-3 text-primary" />
              ) : (
                <Target className="h-3 w-3" />
              )}
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {objective.status === "active" ? "Locked" : objective.status}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{objective.title}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${objective.progress}%` }}
                className={cn(
                  "h-full rounded-full",
                  objective.status === "completed" ? "bg-emerald-500" : "bg-primary"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname()

  const mobileItems = [
    { href: "/app", label: "Focus", icon: Target },
    { href: "/app/domino", label: "Path", icon: GitBranch },
    { href: "/app/focus", label: "Session", icon: Timer },
    { href: "/app/habit", label: "Habit", icon: Flame },
    { href: "/app/review", label: "Review", icon: ClipboardCheck },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/[0.04] bg-[hsl(220,20%,4%)]/90 backdrop-blur-lg lg:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
