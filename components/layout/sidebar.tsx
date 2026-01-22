"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ghost, LayoutDashboard, Target, BarChart3, Settings, HelpCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Deadlines", href: "/app/deadlines", icon: Target },
  { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { name: "Settings", href: "/app/settings", icon: Settings },
]

const bottomNav = [
  { name: "Help Center", href: "#", icon: HelpCircle },
  { name: "Report", href: "#", icon: AlertTriangle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-[hsl(220,15%,6%)] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
            <Ghost className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">ONE</h1>
          <p className="text-[11px] text-muted-foreground">Deadline Tracker</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg glow-green"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px]",
                    isActive && "drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]"
                  )} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary-foreground"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="space-y-1">
          {bottomNav.map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Status Card */}
        <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-medium text-primary">System Active</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tracking 5 deadlines
          </p>
        </div>
      </div>
    </div>
  )
}
