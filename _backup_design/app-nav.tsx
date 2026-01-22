"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Plus,
  GitBranch,
  Calendar,
  Map,
  Timer,
  Flame,
  Shield,
  ClipboardCheck,
  Lock,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

const mainNavItems = [
  { href: "/app", label: "Dashboard", icon: Target, description: "Your ONE thing", color: "primary" },
  { href: "/app/define", label: "Define", icon: Plus, description: "Set objective", color: "primary", locked: true },
]

const systemNavItems = [
  { href: "/app/domino", label: "Domino", icon: GitBranch, description: "Goal cascade", color: "violet" },
  { href: "/app/411", label: "4-1-1", icon: Calendar, description: "Weekly goals", color: "cyan" },
  { href: "/app/gps", label: "GPS", icon: Map, description: "Purpose & goals", color: "orange" },
]

const focusNavItems = [
  { href: "/app/focus", label: "Focus", icon: Timer, description: "Deep work", color: "primary" },
  { href: "/app/habit", label: "66 Days", icon: Flame, description: "Build habit", color: "orange" },
  { href: "/app/shield", label: "Shield", icon: Shield, description: "Block thieves", color: "cyan" },
  { href: "/app/review", label: "Review", icon: ClipboardCheck, description: "Reflect", color: "violet" },
]

function NavItem({ item, isActive, isLocked }: {
  item: typeof mainNavItems[0],
  isActive: boolean,
  isLocked: boolean
}) {
  const isDisabled = item.locked && isLocked
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const colorClasses: Record<string, { bg: string, text: string, border: string, glow: string }> = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      glow: "shadow-[0_0_20px_rgba(0,255,136,0.15)]"
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]"
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]"
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]"
    },
  }

  const colors = colorClasses[item.color] || colorClasses.primary

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className={cn(
              "group relative rounded-xl transition-all duration-300",
              !isCollapsed && "h-11",
              isCollapsed && "!w-8 !h-8 !p-0 justify-center mx-auto",
              isActive && [colors.bg, colors.border, colors.glow, "border"],
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <Link
              href={isDisabled ? "#" : item.href}
              onClick={(e) => isDisabled && e.preventDefault()}
              className={cn(isCollapsed && "justify-center")}
            >
              {/* Icon */}
              {isDisabled ? (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-300",
                  isActive ? colors.text : "text-muted-foreground group-hover:text-foreground"
                )} />
              )}

              {/* Label - hidden when collapsed */}
              {!isCollapsed && (
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  isActive ? colors.text : "text-foreground"
                )}>
                  {item.label}
                </span>
              )}

              {/* Chevron for active - hidden when collapsed */}
              {isActive && !isCollapsed && (
                <ChevronRight className={cn("h-4 w-4 ml-auto", colors.text)} />
              )}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{item.label}</span>
          <span className="text-muted-foreground text-xs">— {item.description}</span>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

function ObjectiveCard() {
  const { objective } = useAppStore()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (!objective || isCollapsed) return null

  const statusConfig = {
    active: {
      bg: "from-primary/10 to-primary/5",
      border: "border-primary/20",
      icon: Lock,
      label: "Locked In",
      progressColor: "bg-primary"
    },
    completed: {
      bg: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/20",
      icon: Sparkles,
      label: "Completed",
      progressColor: "bg-emerald-500"
    },
    failed: {
      bg: "from-red-500/10 to-red-500/5",
      border: "border-red-500/20",
      icon: Target,
      label: "Failed",
      progressColor: "bg-red-500"
    },
  }

  const config = statusConfig[objective.status] || statusConfig.active
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mx-2 mb-2 rounded-2xl border p-4",
        `bg-gradient-to-br ${config.bg}`,
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md",
          objective.status === "active" ? "bg-primary/20" :
          objective.status === "completed" ? "bg-emerald-500/20" : "bg-red-500/20"
        )}>
          <Icon className={cn(
            "h-3.5 w-3.5",
            objective.status === "active" ? "text-primary" :
            objective.status === "completed" ? "text-emerald-400" : "text-red-400"
          )} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {config.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold mb-3 line-clamp-2">{objective.title}</p>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{objective.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${objective.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full rounded-full", config.progressColor)}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AppSidebarContent() {
  const pathname = usePathname()
  const { isLocked } = useAppStore()
  const locked = isLocked()

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="border-0"
    >
      {/* Header */}
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Link href="/app" className="flex items-center gap-3 group group-data-[collapsible=icon]:justify-center">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-base font-bold tracking-tight">DeadSign</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">The ONE Thing OS</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={locked}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={false}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Focus */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            Focus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {focusNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={false}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2">
        <ObjectiveCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AppNav({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebarContent />
      {children && (
        <SidebarInset>
          {children}
        </SidebarInset>
      )}
    </SidebarProvider>
  )
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname()

  const mobileItems = [
    { href: "/app", label: "Focus", icon: Target, color: "primary" },
    { href: "/app/domino", label: "Path", icon: GitBranch, color: "violet" },
    { href: "/app/focus", label: "Session", icon: Timer, color: "primary" },
    { href: "/app/habit", label: "Habit", icon: Flame, color: "orange" },
    { href: "/app/review", label: "Review", icon: ClipboardCheck, color: "cyan" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[hsl(220,20%,5%)]/95 backdrop-blur-xl lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground active:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
